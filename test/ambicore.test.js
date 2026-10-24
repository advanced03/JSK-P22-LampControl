const test = require('node:test')
const assert = require('node:assert/strict')
const core = require('../ambicore.js')

function frame(width, height, fill) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fill(x, y)
      const i = (y * width + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = 255
    }
  }
  return data
}

const lampColor = (rgb) => core.grayGuard(core.vividify(rgb, 40))

test('near-gray scenes never get a color tint on the lamp', () => {
  for (const [r, g, b] of [[32, 31, 28], [30, 30, 34], [20, 18, 15], [60, 58, 55], [12, 10, 8], [200, 198, 195]]) {
    const out = lampColor([r, g, b])
    assert.ok(Math.max(...out) - Math.min(...out) < 3, `(${r},${g},${b}) -> ${out}`)
  }
})

test('a saturated scene keeps its hue', () => {
  const out = lampColor([200, 40, 40])
  assert.ok(out[0] > 150 && out[1] < 80 && out[2] < 80)
})

test('black detector uses hysteresis', () => {
  const detector = core.createBlackDetector()
  const result = [2, 5, 7, 9, 5, 3, 2].map((value) => detector.update([value, value, value]))
  assert.deepEqual(result, [true, true, true, false, false, true, true])
})

test('letterbox bars are detected', () => {
  const width = 192
  const height = 108
  const data = frame(width, height, (x, y) => (y >= 14 && y < 94 ? [200, 30, 30] : [0, 0, 0]))
  assert.deepEqual(core.detectBars(data, width, height), { left: 0, right: 191, top: 14, bottom: 93 })
})

test('settings are clamped to the slider ranges', () => {
  const settings = core.migrateSettings({ fps: 500, smooth: -3, bright: 1, hdramt: 250, calRed: 'x' })
  assert.equal(settings.fps, 30)
  assert.equal(settings.smooth, 0)
  assert.equal(settings.bright, 5)
  assert.equal(settings.hdramt, 100)
  assert.equal(settings.calRed, 100)
  assert.equal(core.migrateSettings(null).fps, core.SETTINGS_DEFAULTS.fps)
  assert.equal(core.migrateSettings([1, 2]).fps, core.SETTINGS_DEFAULTS.fps)
})

test('old default settings are upgraded only before versioning', () => {
  assert.equal(core.migrateSettings({ smooth: 35 }).smooth, core.SETTINGS_DEFAULTS.smooth)
  assert.equal(core.migrateSettings({ version: 2, smooth: 35 }).smooth, 35)
})
