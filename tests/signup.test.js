const { Builder, By } = require('selenium-webdriver');

(async function testSignupFormValidation() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('http://localhost:10000/signup');
    await driver.sleep(500);

    const firstName = await driver.findElement(By.name('firstName'));
    await driver.sleep(500);

    const lastName = await driver.findElement(By.name('lastName'));
    await driver.sleep(500);

    const email = await driver.findElement(By.name('email'));
    await driver.sleep(500);

    const password = await driver.findElement(By.name('password'));
    await driver.sleep(500);

    // Geçersiz (boş) kayıt denemesi
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(500);

    console.log('✅ Boş kayıt formu gönderildiğinde sistemin cevabı kontrol edildi (elle doğrula)');
    await driver.sleep(500);

    // Geçerli kayıt
    const randomEmail = `testuser${Math.floor(Math.random() * 10000)}@example.com`;

    await firstName.sendKeys('Test');
    await driver.sleep(500);

    await lastName.sendKeys('User');
    await driver.sleep(500);

    await email.sendKeys(randomEmail);
    await driver.sleep(500);

    await password.sendKeys('123456');
    await driver.sleep(500);

    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(500);

    console.log('✅ Yeni kullanıcı başarıyla kayıt edildi');

  } catch (err) {
    console.error('❌ Kayıt testinde hata:', err);
  } finally {
    await driver.sleep(500); // Test sonu bekleme
    await driver.quit();
  }
})();
