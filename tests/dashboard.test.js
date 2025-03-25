const { Builder, By, until } = require('selenium-webdriver');

(async function testDashboardEntries() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('http://localhost:10000/login');
    await driver.sleep(500);

    await driver.findElement(By.name('email')).sendKeys('bahadirihsan23@gmail.com');
    await driver.sleep(500);

    await driver.findElement(By.name('password')).sendKeys('123456');
    await driver.sleep(500);

    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(500);

    await driver.wait(until.urlContains('/dashboard'), 5000);
    await driver.sleep(500);

    const rows = await driver.findElements(By.css('.card'));
    await driver.sleep(500);

    if (rows.length > 0) {
      console.log(`✅ Dashboard'da ${rows.length} adet kayıt bulundu`);
    } else {
      console.log('⚠️ Dashboard boş olabilir');
    }

  } catch (err) {
    console.error('❌ Dashboard testi başarısız:', err);
  } finally {
    await driver.sleep(500);
    await driver.quit();
  }
})();
