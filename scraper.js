// scraper.js
const mongoose = require("mongoose");


mongoose.connect("mongodb://127.0.0.1:27017/bmiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bmiSchema = new mongoose.Schema({
  value: String,
  category: String,
  description: String,
});

const BMI = mongoose.model("BMI", bmiSchema);

async function saveBMIResult(bmiValue, bmiCategory, bmiDescription) {
  const bmiData = new BMI({
    value: bmiValue,
    category: bmiCategory,
    description: bmiDescription,
  });

  try {
    await bmiData.save();
    console.log("✅ BMI verisi MongoDB'ye kaydedildi.");
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
  }
}

module.exports = saveBMIResult;
                    
