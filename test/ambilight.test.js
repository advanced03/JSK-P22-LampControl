// Regression tests for the Ambilight sync logic. They run the real ambicore.js and ambilight.js inside a
// vm with a fake DOM, lamp and screen capture (see ambilight-harness.js), so they need no dependencies.
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeHarness, sleep } = require('./ambilight-harness')

async function startSync(h) {
  await sleep(20) // let populateScreens() finish
  h.elements.start.click()
  await sleep(150)
}

test('stopping sync restores the lamp brightness after a black scene parked it at 1%', async () => {
  const h = makeHarness({ cfg: { allowTurnOff: false, fps: 30, smooth: 0 }, scene: [0, 0, 0] })
  await startSync(h)
  assert.ok(h.log.brightness.includes(1), 'black scene should set brightness 1')
  h.ambilight().stop()
  await sleep(50)
  assert.equal(h.log.brightness.at(-1), h.lamp.brightness)
})

test('the scene color is sent again after the calibration wizard closes', async () => {
  const h = makeHarness({ cfg: { fps: 30, smooth: 0, vivid: 0, dominant: false }, scene: [120, 120, 200] })
  await startSync(h)
  h.elements['open-calibration-wizard'].click()
  await sleep(120)
  const wizardColor = h.log.colors.at(-1).rgb
  h.elements['calibration-wizard'].close()
  await sleep(300)
  assert.notDeepEqual(h.log.colors.at(-1).rgb, wizardColor)
  h.ambilight().stop()
})

test('a temporarily missing display does not overwrite the preferred screen', async () => {
  const h = makeHarness({ cfg: { screen: 'screen:1:0' } })
  await sleep(30)
  h.screensResult = [{ id: 'screen:0:0', label: 'A' }]
  h.displayChange()
  await sleep(1700)
  assert.equal(JSON.parse(h.storage.get('cfg')).screen, 'screen:1:0')
})

test('corrupt saved settings are replaced by sane values', () => {
  const { makeHarness: make } = require('./ambilight-harness')
  const core = make().context.AmbiCore
  const settings = core.migrateSettings({ fps: 'abc', smooth: null, bright: 9999, vivid: -50, hdramt: 'x', screen: {} })
  assert.equal(settings.fps, core.SETTINGS_DEFAULTS.fps)
  assert.equal(settings.smooth, core.SETTINGS_DEFAULTS.smooth)
  assert.equal(settings.bright, 100)
  assert.equal(settings.vivid, 0)
  assert.equal(settings.hdramt, core.SETTINGS_DEFAULTS.hdramt)
  assert.equal(settings.screen, '')
})

test('screen capture is requested at a reduced size with the display aspect ratio', async () => {
  const h = makeHarness({ cfg: { fps: 20 } })
  await startSync(h)
  const { mandatory } = h.constraintsSeen[0].video
  assert.equal(mandatory.maxWidth, 640)
  assert.equal(mandatory.maxHeight, 360)
  h.ambilight().stop()
})

test('a reconnect request is single-use and only honoured with auto-reconnect on', async () => {
  const h = makeHarness({ cfg: { fps: 30 } })
  await startSync(h)
  h.lamp.autoReconnect = false
  h.lamp.connected = false
  h.connectionCb(false, 'dropped')
  await sleep(50)
  h.lamp.connected = true
  h.connectionCb(true, 'connected') // manual reconnect, auto-reconnect off: no resume
  await sleep(60)
  h.lamp.autoReconnect = true
  h.connectionCb(true, 'connected') // a later status change must not resume the old session
  await sleep(1800)
  assert.equal(h.elements.start.textContent, 'button.startSync')
})

test('sync resumes by itself after an unexpected drop when auto-reconnect is on', async () => {
  const h = makeHarness({ cfg: { fps: 30 } })
  await startSync(h)
  h.lamp.connected = false
  h.connectionCb(false, 'dropped')
  await sleep(40)
  assert.equal(h.elements.start.textContent, 'button.startSync')
  h.lamp.connected = true
  h.connectionCb(true, 'connected')
  await sleep(1900)
  assert.equal(h.elements.start.textContent, 'button.stopSync')
  h.ambilight().stop()
})
