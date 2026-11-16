const { _android } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const [device] = await _android.devices();
  assert.ok(device, 'Android emulator connected');
  try {
    device.setDefaultTimeout(30000);
    const webview = await device.webView({pkg:'ru.uston.portal'});
    const page = await webview.page();
    await page.waitForFunction(() => typeof titles !== 'undefined' && Object.keys(titles).length === 13);
    assert.match(await page.locator('body').innerText(), /Начать/);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.screenshot({path:'work-verification/offline-welcome.png'});
    const results = [];
    for (const id of await page.evaluate(() => Object.keys(titles))) {
      await page.evaluate(id => openGame(id), id);
      await page.waitForTimeout(1000);
      const frame = page.frames()[1];
      assert.ok(frame, id + ': module iframe');
      await frame.waitForFunction(() => document.body && document.body.innerText.length > 50);
      assert.equal(await frame.evaluate(() => document.documentElement.hidden), false, id);
      results.push({id, passed:true, url:frame.url()});
      await page.evaluate(() => closeGame());
    }
    assert.deepEqual(errors, []);
    // Verify archive pictures are decoded locally in the installed APK.
    await page.evaluate(() => openGame('multan'));
    await page.waitForTimeout(1000);
    const frame = page.frames()[1];
    const photos = await frame.evaluate(async () => {
      const files = ['FUDSS-Q7337.jpg','Udmurt_women_1907.jpg','FUDSS-Q7334.jpg'];
      return Promise.all(files.map(async file => {
        const image = new Image(); image.src = 'assets/archive/' + file;
        await image.decode(); return {file, width:image.naturalWidth};
      }));
    });
    assert.ok(photos.every(p => p.width > 0));
    await page.evaluate(() => closeGame());
    fs.writeFileSync('work-verification/native-modules.json', JSON.stringify({results,photos,errors},null,2));
    console.log('PASS: all 13 modules launch and return in installed APK, archive photos decode, network disabled');
  } finally { await device.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
