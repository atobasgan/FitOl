const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const path = require('path');

const app = express(); // Önce app tanımlanmalı

app.use(express.static(path.join(__dirname, 'public')));

// diğer kodlar...

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/bmiApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// BMI Schema ve model
const bmiSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  bmiValue: Number,
  bmiCategory: String,
  bmiDescription: String,
  exercisePlan: String,
  dietPlan: String,
  exerciseType: String, // 'home', 'gym' veya null
  planPreference: String, // 'diet', 'exercise', 'both'
  selectedDiet: Number, // 1: Tavuklu, 2: Etli, 3: Vegan
  selectedOption: String, // 'diet', 'exercise', 'both'
  date: { type: Date, default: Date.now }
});

const BMI = mongoose.model('BMI', bmiSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'fitol-secret',
  resave: false,
  saveUninitialized: true,
}));

function getExercisePlan(bmiValue, type) {
    if (!type) return null;
  
    function formatPlan(title, steps) {
      return `<b>${title}</b><br>` + steps.map(step => `🕒 ${step}`).join('<br>');
    }
  
    if (bmiValue < 18.5) {
      return type === 'home' ? formatPlan('🏠 Evde Egzersiz (Zayıf Birey)', [
        '3x12 Şınav',
        '3x12 Squat',
        '3x30sn Plank',
        '3x10 Sandalye Dips',
        '3x12 Glute Bridge'
      ]) : formatPlan('🏋️‍♂️ Spor Salonu Egzersizi (Zayıf Birey)', [
        '4x10 Bench Press',
        '3x12 Leg Press',
        '3x10 Lat Pulldown',
        '3x10 Dumbbell Shoulder Press',
        '3x12 Cable Triceps Pushdown'
      ]);
    } else if (bmiValue < 25) {
      return type === 'home' ? formatPlan('🏠 Evde Egzersiz (Normal Birey)', [
        '3x30sn Jumping Jack',
        '3x15 Push-up',
        '3x10 Split Squat',
        '3x20sn Mountain Climber',
        '3x15 Superman'
      ]) : formatPlan('🏋️‍♂️ Spor Salonu Egzersizi (Normal Birey)', [
        '4x8 Deadlift',
        '3x10 Pull-up / Lat Pulldown',
        '3x10 Incline Bench Press',
        '3x12 Leg Curl',
        '3x1dk Plank'
      ]);
    } else if (bmiValue < 30) {
      return type === 'home' ? formatPlan('🏠 Evde Egzersiz (Fazla Kilolu)', [
        '3x10 Burpee',
        '3x30sn High Knees',
        '3x15 Squat',
        '3x30sn Plank',
        '3x30sn Jumping Jack'
      ]) : formatPlan('🏋️‍♂️ Spor Salonu Egzersizi (Fazla Kilolu)', [
        '30dk Treadmill',
        '3x15 Kettlebell Swing',
        '3x12 Leg Press',
        '3x10 Chest Press',
        '3x12 Seated Row'
      ]);
    } else {
      return type === 'home' ? formatPlan('🏠 Evde Egzersiz (Obez)', [
        '3x1dk Yerinde Yürüyüş',
        '3x10 Duvar Squat',
        '3x10 Sandalye Otur-Kalk',
        '3x15 Kol Rotasyonu',
        '3x2dk Nefes Egzersizi'
      ]) : formatPlan('🏋️‍♂️ Spor Salonu Egzersizi (Obez)', [
        '20dk Eliptik Bisiklet',
        '3x12 Leg Extension (Hafif)',
        '3x10 Cable Row',
        '3x10 Shoulder Press (Makine)',
        '15dk Treadmill Yürüyüş'
      ]);
    }
  }
  

function getDietPlans(bmiValue) {
    if (bmiValue < 18.5) {
      return `
        <b>1️⃣ Vegan Yüksek Kalorili Diyet (~3700 kcal):</b><br>
        🕖 Kahvaltı (810 kcal): 3 dilim tam tahıllı ekmek, fıstık ezmesi, büyük muz, ceviz, badem sütü<br>
        🕛 Ara Öğün (450 kcal): Hurma + kaju, yulaf sütü<br>
        🕑 Öğle (1020 kcal): Mercimekli pilav, humus, avokado, portakal suyu<br>
        🕟 Ara Öğün (400 kcal): Smoothie<br>
        🕖 Akşam (850 kcal): Nohut yemeği, tahıllı ekmek, sebze salatası, bitkisel süt<br>
        🕘 Gece Öğünü (450 kcal): Tahin-pekmez, ceviz<br><br>
  
        <b>2️⃣ Tavuklu Yüksek Kalorili Diyet (~3800 kcal):</b><br>
        🕖 Kahvaltı (860 kcal): Tam tahıllı ekmek, beyaz peynir, haşlanmış yumurta, bal, zeytin, süt<br>
        🕛 Ara Öğün (400 kcal): Ceviz, kefir<br>
        🕑 Öğle (1000 kcal): 200g tavuk, bulgur pilavı, yoğurt, sebze salatası<br>
        🕟 Ara Öğün (450 kcal): Smoothie<br>
        🕖 Akşam (900 kcal): Tavuk sote, makarna, ekmek, ayran<br>
        🕘 Gece Öğünü (400 kcal): Badem, süt<br><br>
  
        <b>3️⃣ Kırmızı Etli Yüksek Kalorili Diyet (~3900 kcal):</b><br>
        🕖 Kahvaltı (900 kcal): Yumurta, kaşar peyniri, tam tahıllı ekmek, bal, tereyağı, süt<br>
        🕛 Ara Öğün (450 kcal): Ceviz, yoğurt<br>
        🕑 Öğle (1020 kcal): 200g ızgara et, pirinç pilavı, sebze, ayran<br>
        🕟 Ara Öğün (500 kcal): Fıstık ezmeli ekmek, muz, kefir<br>
        🕖 Akşam (900 kcal): Dana sote, makarna, kefir<br>
        🕘 Gece Öğünü (400 kcal): Fındık, kuru üzüm, süt
      `;
    } else if (bmiValue < 25) {
      return `
        <b>1️⃣ Tavuk Ağırlıklı Diyet (~1800 kcal):</b><br>
        🕖 Kahvaltı (350 kcal): Yumurta, tam buğday ekmeği, zeytin, domates, salatalık, zeytinyağı<br>
        🕛 Ara Öğün (150 kcal): Badem, elma<br>
        🕑 Öğle (500 kcal): 150g ızgara tavuk, bulgur pilavı, yoğurt<br>
        🕟 Ara Öğün (200 kcal): Kefir, fındık<br>
        🕖 Akşam (450 kcal): 200g fırın tavuk but, ızgara sebze<br>
        🕘 Gece Öğünü (100 kcal): Yoğurt, bal<br><br>
  
        <b>2️⃣ Kırmızı Etli Diyet (~1900 kcal):</b><br>
        🕖 Kahvaltı (400 kcal): 2 yumurta, ekmek, zeytin, sebze, süt<br>
        🕛 Ara Öğün (150 kcal): Ceviz, armut<br>
        🕑 Öğle (550 kcal): 150g dana bonfile, zeytinyağlı sebze yemeği, yoğurt<br>
        🕟 Ara Öğün (200 kcal): Kefir, badem<br>
        🕖 Akşam (500 kcal): 200g kuzu şiş, ızgara sebze, zeytinyağı<br>
        🕘 Gece Öğünü (100 kcal): Beyaz peynir, ekmek<br><br>
  
        <b>3️⃣ Vegan Diyet (~1800 kcal):</b><br>
        🕖 Kahvaltı (350 kcal): Tam buğday ekmeği, fıstık ezmesi, muz, badem sütü<br>
        🕛 Ara Öğün (150 kcal): Badem, hurma<br>
        🕑 Öğle (500 kcal): Mercimek köftesi, sebze yemeği, bitkisel yoğurt<br>
        🕟 Ara Öğün (200 kcal): Hindistan cevizi sütü, kaju<br>
        🕖 Akşam (450 kcal): Nohutlu sebze yemeği, bulgur pilavı, zeytinyağı<br>
        🕘 Gece Öğünü (100 kcal): Yulaf + badem sütü
      `;
    } else if (bmiValue < 30) {
      return `
        <b>1️⃣ Tavuklu Diyet (~1600 kcal):</b><br>
        🕖 Kahvaltı (350 kcal): 2 haşlanmış yumurta, tam buğday ekmeği, zeytin, sebzeler<br>
        🕛 Ara Öğün (150 kcal): Badem, elma<br>
        🕑 Öğle (500 kcal): 150g tavuk göğsü, bulgur pilavı, yoğurt<br>
        🕟 Ara Öğün (200 kcal): Kefir, fındık<br>
        🕖 Akşam (400 kcal): Tavuk but, ızgara sebze<br>
        🕘 Gece Öğünü (100 kcal): Yoğurt, bal<br><br>
  
        <b>2️⃣ Kırmızı Etli Diyet (~1700 kcal):</b><br>
        🕖 Kahvaltı (400 kcal): 2 yumurta, ekmek, zeytin, sebze, süt<br>
        🕛 Ara Öğün (150 kcal): Ceviz, armut<br>
        🕑 Öğle (500 kcal): 150g dana bonfile, sebze, yoğurt<br>
        🕟 Ara Öğün (200 kcal): Kefir, badem<br>
        🕖 Akşam (450 kcal): Kuzu şiş, sebze, zeytinyağı<br>
        🕘 Gece Öğünü (100 kcal): Beyaz peynir, ekmek<br><br>
  
        <b>3️⃣ Vegan Diyet (~1600 kcal):</b><br>
        🕖 Kahvaltı (350 kcal): Tam buğday ekmeği, fıstık ezmesi, muz, badem sütü<br>
        🕛 Ara Öğün (150 kcal): Badem, hurma<br>
        🕑 Öğle (500 kcal): Mercimek köftesi, sebze yemeği, bitkisel ayran<br>
        🕟 Ara Öğün (200 kcal): Hindistan cevizi sütü, kaju<br>
        🕖 Akşam (400 kcal): Nohutlu sebze yemeği, bulgur pilavı, zeytinyağı<br>
        🕘 Gece Öğünü (100 kcal): Yulaf + badem sütü
      `;
    } else {
      return `
        <b>1️⃣ Tavuklu Diyet (~1500 kcal):</b><br>
        🕖 Kahvaltı (350 kcal): 2 haşlanmış yumurta, ekmek, zeytin, sebze, zeytinyağı<br>
        🕛 Ara Öğün (150 kcal): Badem, elma<br>
        🕑 Öğle (500 kcal): 150g tavuk göğsü, bulgur pilavı, yoğurt<br>
        🕟 Ara Öğün (200 kcal): Kefir, fındık<br>
        🕖 Akşam (400 kcal): Tavuk but, ızgara sebze<br>
        🕘 Gece Öğünü (100 kcal): Yoğurt, bal<br><br>
  
        <b>2️⃣ Kırmızı Etli Diyet (~1600 kcal):</b><br>
        🕖 Kahvaltı (400 kcal): Yumurta, kaşar peyniri, ekmek, zeytin, süt<br>
        🕛 Ara Öğün (150 kcal): Muz, fındık<br>
        🕑 Öğle (450 kcal): 2 köfte, makarna, salata, yoğurt<br>
        🕟 Ara Öğün (200 kcal): Ayran, galeta<br>
        🕖 Akşam (400 kcal): Sebze yemeği, mercimek, ekmek, cacık<br>
        🕘 Gece Öğünü (100 kcal): Beyaz peynir, ekmek<br><br>
  
        <b>3️⃣ Vegan Diyet (~1500 kcal):</b><br>
        🕖 Kahvaltı (350 kcal): Avokado + fıstık ezmesi, ekmek, muz, badem sütü<br>
        🕛 Ara Öğün (150 kcal): Badem, hurma<br>
        🕑 Öğle (500 kcal): Mercimek köftesi, sebze yemeği, bitkisel ayran<br>
        🕟 Ara Öğün (200 kcal): Bitkisel süt, kaju<br>
        🕖 Akşam (400 kcal): Nohutlu sebze yemeği, bulgur pilavı, zeytinyağı<br>
        🕘 Gece Öğünü (100 kcal): Yulaf + badem sütü
      `;
    }
  }

// Ana Sayfa (Sadece giriş yapmış kullanıcılar erişebilir)
// Ana sayfa: Eğer kullanıcı giriş yapmamışsa splash ekranını göster, aksi halde dashboard'a yönlendir.
app.get('/', (req, res) => {
    if (!req.session.user) {
      res.render('splash');
    } else {
      res.redirect('/dashboard');
    }
  });
  

// Plan tercihi ekranı
app.post('/choose-plan', async (req, res) => {
    const { bmiId } = req.body;
    const bmiRecord = await BMI.findById(bmiId);
    if (!bmiRecord) return res.send('BMI kaydı bulunamadı.');
  
    res.render('choose-plan', {
      bmiId: bmiRecord._id,
      bmiCategory: bmiRecord.bmiCategory
    });
  });
  
// Plan seçimi sonrası yönlendirme
app.post('/submit-plan-choice', async (req, res) => {
    const { bmiId, planPreference, exerciseType } = req.body;
    const bmiRecord = await BMI.findById(bmiId);
    if (!bmiRecord) return res.send('BMI kaydı bulunamadı.');
  
    bmiRecord.planPreference = planPreference;
    bmiRecord.exerciseType = planPreference === 'exercise' || planPreference === 'both' ? exerciseType : null;
    await bmiRecord.save();
  
    const dietPlan = planPreference !== 'exercise' ? bmiRecord.dietPlan || bmiRecord.dietPlan : null;
    const exercisePlan = planPreference !== 'diet' ? getExercisePlan(bmiRecord.bmiValue, exerciseType) : null;
  
    res.render('result', {
      name: bmiRecord.name,
      age: bmiRecord.age,
      gender: bmiRecord.gender,
      height: bmiRecord.height,
      weight: bmiRecord.weight,
      bmiValue: bmiRecord.bmiValue.toFixed(2),
      bmiCategory: bmiRecord.bmiCategory,
      bmiDescription: bmiRecord.bmiDescription,
      exercisePlan,
      dietPlan,
      bmiId: bmiRecord._id,
      selectedDiet: bmiRecord.selectedDiet,
      selectedDietPlan: bmiRecord.dietPlan
    });
  });
  

// VKİ Hesaplama
app.post('/calculate', async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  
    const fullName = req.session.user.firstName + ' ' + req.session.user.lastName;
    let { age, gender, height, weight } = req.body;
  
    // Tip dönüşümleri ve temizleme
    age = parseInt(age);
    height = parseFloat(height);
    weight = parseFloat(weight);
  
    // ❌ GEÇERSİZ GİRİŞ KONTROLLERİ
    if (!age || !height || !weight || height <= 0 || weight <= 0 || age <= 0) {
        return res.send(`
          <html>
            <head>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light d-flex justify-content-center align-items-center" style="height: 100vh;">
              <div class="card shadow p-4" style="max-width: 500px; width: 100%;">
                <h3 class="text-danger text-center mb-3">⚠️ Geçersiz Değer Girdiniz</h3>
                <p class="text-center mb-4">Lütfen yaş, boy ve kilo alanlarına pozitif ve sayısal değerler giriniz.</p>
                <div class="d-grid">
                  <a href="/calculate" class="btn btn-primary btn-lg">🔁 Tekrar Dene</a>
                </div>
              </div>
            </body>
          </html>
        `);
      }
  
    const heightMeters = height / 100;
    const bmiValue = weight / (heightMeters * heightMeters);
  
    let bmiCategory = '';
    let bmiDescription = '';
    let exercisePlan = null;  // Başlangıçta plan tercihi yapılmadığı için null
    let dietPlan = getDietPlans(bmiValue);
  
    if (bmiValue < 18.5) {
      bmiCategory = 'Zayıf';
      bmiDescription = 'Vücut ağırlığınız düşük. Sağlıklı kilo almak için beslenmenizi gözden geçirin.';
    } else if (bmiValue < 24.9) {
      bmiCategory = 'Normal';
      bmiDescription = 'Sağlıklı bir kilodasınız. Mevcut rutininizi koruyun.';
    } else if (bmiValue < 29.9) {
      bmiCategory = 'Fazla Kilolu';
      bmiDescription = 'Biraz kilo vermeniz önerilir. Aktif yaşam tarzı benimseyin.';
    } else {
      bmiCategory = 'Obez';
      bmiDescription = 'Kilo vermeniz sağlığınız açısından önemlidir.';
    }
  
    const newBMI = new BMI({
      name: fullName,
      age,
      gender,
      height,
      weight,
      bmiValue,
      bmiCategory,
      bmiDescription,
      exercisePlan,
      dietPlan
    });
  
    await newBMI.save();
  
    res.render('result', {
      name: fullName,
      age,
      gender,
      height,
      weight,
      bmiValue: bmiValue.toFixed(2),
      bmiCategory,
      bmiDescription,
      exercisePlan,
      dietPlan,
      bmiId: newBMI._id,
      selectedDiet: null,
      selectedDietPlan: null,
      selectedOption: newBMI.selectedOption || null
    });
  });
  

// Kullanıcının plan tercihini (diyet, egzersiz, her ikisi) işle
// Aşağıdaki route'u bu şekilde değiştir:
app.post('/select-option', async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  
    const { selectedOption, bmiId } = req.body;
    const bmiRecord = await BMI.findById(bmiId);
    if (!bmiRecord) return res.send('BMI kaydı bulunamadı.');
  
    bmiRecord.selectedOption = selectedOption;
    await bmiRecord.save();
  
    let selectedDietPlan = null;
    let showDietChoices = selectedOption === 'diet' || selectedOption === 'both';
  
    res.render('result', {
      name: bmiRecord.name,
      age: bmiRecord.age,
      gender: bmiRecord.gender,
      height: bmiRecord.height,
      weight: bmiRecord.weight,
      bmiValue: bmiRecord.bmiValue.toFixed(2),
      bmiCategory: bmiRecord.bmiCategory,
      bmiDescription: bmiRecord.bmiDescription,
      exercisePlan: selectedOption === 'diet' ? null : bmiRecord.exercisePlan,
      dietPlan: showDietChoices ? bmiRecord.dietPlan : null,
      bmiId: bmiRecord._id,
      selectedDiet: null,
      selectedDietPlan,
      selectedOption: bmiRecord.selectedOption
    });
  });
  
  
// Diyet seçimi işlemi
app.post('/select-diet', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { selectedDiet, bmiId } = req.body;
  const bmiRecord = await BMI.findById(bmiId);

  if (!bmiRecord) return res.send('BMI kaydı bulunamadı.');

  bmiRecord.selectedDiet = selectedDiet;

  const fullDietList = getDietPlans(bmiRecord.bmiValue);

  // Diyetleri ayır
  const planMatches = [...fullDietList.matchAll(/<b>\d️⃣.*?:<\/b><br>([\s\S]*?)(?=<b>|$)/g)];
  const selectedPlanText = planMatches[selectedDiet - 1]?.[1] || 'Plan bulunamadı.';

  bmiRecord.dietPlan = `<b>${selectedDiet}️⃣ Seçilen Diyet Planı:</b><br>${selectedPlanText.trim()}`;
  await bmiRecord.save();

  res.render('result', {
    name: bmiRecord.name,
    age: bmiRecord.age,
    gender: bmiRecord.gender,
    height: bmiRecord.height,
    weight: bmiRecord.weight,
    bmiValue: bmiRecord.bmiValue.toFixed(2),
    bmiCategory: bmiRecord.bmiCategory,
    bmiDescription: bmiRecord.bmiDescription,
    exercisePlan: bmiRecord.exercisePlan,
    dietPlan: null,
    bmiId: bmiRecord._id,
    selectedDiet,
    selectedDietPlan: bmiRecord.dietPlan,
    selectedOption: bmiRecord.selectedOption || null
  });
  
});

// Egzersiz türü seçimi işlemi
app.post('/submit-exercise-type', async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  
    const { exerciseType, bmiId } = req.body;
    const bmiRecord = await BMI.findById(bmiId);
    if (!bmiRecord) return res.send('BMI kaydı bulunamadı.');
  
    bmiRecord.exerciseType = exerciseType;
    bmiRecord.exercisePlan = getExercisePlan(bmiRecord.bmiValue, exerciseType);
    await bmiRecord.save();
  
    res.render('result', {
      name: bmiRecord.name,
      age: bmiRecord.age,
      gender: bmiRecord.gender,
      height: bmiRecord.height,
      weight: bmiRecord.weight,
      bmiValue: bmiRecord.bmiValue.toFixed(2),
      bmiCategory: bmiRecord.bmiCategory,
      bmiDescription: bmiRecord.bmiDescription,
      exercisePlan: bmiRecord.exercisePlan,
      dietPlan: bmiRecord.selectedOption === 'diet' ? null : bmiRecord.dietPlan,
      bmiId: bmiRecord._id,
      selectedDiet: bmiRecord.selectedDiet,
      selectedDietPlan: bmiRecord.dietPlan,
      selectedOption: bmiRecord.selectedOption
    });
  });
  
// Kullanıcı geçmiş verileri
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const fullName = req.session.user.firstName + ' ' + req.session.user.lastName;
  const bmiRecords = await BMI.find({ name: fullName });

  res.render('dashboard', { user: req.session.user, records: bmiRecords });
});

// Yeni hesaplama formu
app.get('/calculate', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('index', { user: req.session.user });
});

// Kayıt sayfası
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Kayıt işlemi
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.send('Bu e-posta ile zaten kayıt olunmuş.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword
  });

  await newUser.save();
  req.session.user = newUser;
  res.redirect('/dashboard');
});


// Giriş sayfası
app.get('/login', (req, res) => {
  res.render('login');
});

// Giriş işlemi
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.send('Kullanıcı bulunamadı.');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.send('Hatalı şifre!');
  }

  req.session.user = user;
  res.redirect('/dashboard');
});


// Çıkış işlemi
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Sunucuyu başlat
const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


