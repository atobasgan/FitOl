const { Builder, By, until } = require('selenium-webdriver');

(async function testLoginFlow() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    // 1. Ana sayfaya git
    await driver.get('http://localhost:10000/');

    // 2. Splash videosunun bitmesini bekle (örnek: 5 saniye)
    await driver.sleep(6000);

    // 3. /login sayfasına yönlendirildi mi kontrol et
    await driver.wait(until.urlContains('/login'), 10000);
    console.log('✅ Splash sonrası /login sayfasına yönlendirildi');

    // 4. Login formundaki alanları bul
    await driver.wait(until.elementLocated(By.name('email')), 5000);
    const emailInput = await driver.findElement(By.name('email'));
    const passwordInput = await driver.findElement(By.name('password'));
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));

    // 5. Geçersiz giriş denemesi
    await emailInput.sendKeys('wrong@example.com');
    await passwordInput.sendKeys('wrongpassword');
    await loginButton.click();

    // Tekrar /login sayfasında kalındı mı kontrol et
    await driver.wait(until.urlContains('/login'), 5000);
    console.log('✅ Geçersiz kullanıcı ile giriş reddedildi');

    // ❗ DOM yeniden yüklendiği için elementler artık geçersiz. Bekleyip yeniden seç.
    await driver.sleep(2000); // DOM yeniden oluşsun

    // 6. Sayfa yenilendiği için elementleri yeniden bul
    await driver.wait(until.elementLocated(By.name('email')), 5000);
    const emailInputNew = await driver.findElement(By.name('email'));
    const passwordInputNew = await driver.findElement(By.name('password'));
    const loginButtonNew = await driver.findElement(By.css('button[type="submit"]'));

    // 7. Geçerli kullanıcı bilgilerini gir (veritabanında bu kullanıcı olmalı!)
    await emailInputNew.clear();
    await passwordInputNew.clear();
    await emailInputNew.sendKeys('bahadirihsan23@gmail.com');
    await passwordInputNew.sendKeys('123456');
    await loginButtonNew.click();

    // /dashboard yönlendirmesi bekleniyor
    await driver.wait(until.urlContains('/dashboard'), 10000);
    console.log('✅ Geçerli kullanıcı ile /dashboard\'a erişildi');

  } catch (error) {
    console.error('❌ Testte hata oluştu:', error);
  } finally {
    await driver.quit();
  }
})();
