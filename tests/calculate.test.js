const { Builder, By, until } = require('selenium-webdriver');

(async function testBMICalculationValidation() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    // 1. Giriş yap
    await driver.get('http://localhost:10000/login');
    await driver.sleep(500);

    await driver.findElement(By.name('email')).sendKeys('bahadirihsan23@gmail.com');
    await driver.sleep(500);

    await driver.findElement(By.name('password')).sendKeys('123456');
    await driver.sleep(500);

    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(500);

    // 2. Dashboard yönlendirmesi bekleniyor
    await driver.wait(until.urlContains('/dashboard'), 5000);
    console.log('✅ Başarıyla giriş yapıldı');
    await driver.sleep(500);

    // 3. BMI hesaplama sayfasına git
    await driver.get('http://localhost:10000/calculate');
    await driver.sleep(500);

    // 4. Form inputlarını doldur
    await driver.findElement(By.name('age')).sendKeys('abc');     // geçersiz yaş
    await driver.sleep(500);

    await driver.findElement(By.name('height')).sendKeys('-170'); // geçersiz boy
    await driver.sleep(500);

    await driver.findElement(By.name('weight')).sendKeys('0');    // geçersiz kilo
    await driver.sleep(500);

    // 5. Hesapla butonuna tıkla
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(500);

    // 6. Sonuçları bekle ve kontrol et
    const currentUrl = await driver.getCurrentUrl();

    if (currentUrl.includes('/calculate')) {
      console.log('✅ Geçersiz giriş sonrası kullanıcı hesaplama sayfasında kaldı.');
    } else {
      console.warn('⚠️ Kullanıcı başka bir sayfaya yönlendirildi, hata kontrol edilmeli.');
    }

  } catch (err) {
    console.error('❌ BMI hesaplama testinde hata:', err);
  } finally {
    await driver.sleep(500); // son ekran için bekleme
    await driver.quit();
  }
})();
