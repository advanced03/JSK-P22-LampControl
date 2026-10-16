const test = require('node:test')
const assert = require('node:assert/strict')
const A = require('../ambicore.js')

// Builds RGBA frame data from a function (x, y) -> [r, g, b].
function frame(width, height, pixel) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y)
      const i = (y * width + x) * 4
      data.set([r, g, b, 255], i)
    }
  }
  return data
}
const near = (actual, expected, tolerance = 2) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`)
}

test('averaging happens in linear light, not gamma space', () => {
  const half = frame(10, 10, (x) => (x < 5 ? [255, 0, 0] : [0, 0, 0]))
  const [red] = A.frameColor(half, 10, 10, {})
  near(red, 188, 2) // gamma-space averaging would give 128
})

test('dominant mode favors vivid pixels over gray ones', () => {
  const mostlyGrayWithRed = frame(20, 20, (x) => (x < 3 ? [255, 0, 0] : [110, 110, 110]))
  const plain = A.frameColor(mostlyGrayWithRed, 20, 20, {})
  const dominant = A.frameColor(mostlyGrayWithRed, 20, 20, { dominant: true })
  const saturation = ([r, g, b]) => (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b)
  assert.ok(saturation(dominant) > saturation(plain) * 2, 'dominant result should be clearly more saturated')
  assert.ok(Math.max(...dominant) <= 255)
})

test('dominant mode keeps a plain gray scene gray', () => {
  const gray = frame(16, 16, () => [90, 90, 90])
  const [r, g, b] = A.frameColor(gray, 16, 16, { dominant: true })
  near(r, 90, 1)
  near(g, 90, 1)
  near(b, 90, 1)
})

test('letterbox bars are ignored', () => {
  const letterboxed = frame(64, 36, (x, y) => (y < 6 || y >= 30 ? [0, 0, 0] : [0, 0, 255]))
  const withBars = A.frameColor(letterboxed, 64, 36, {})
  const ignoringBars = A.frameColor(letterboxed, 64, 36, { ignoreBars: true })
  near(ignoringBars[2], 255, 1)
  assert.ok(withBars[2] < 255)
  assert.deepEqual(
    (({ top, bottom }) => [top, bottom])(A.detectBars(letterboxed, 64, 36)),
    [6, 29],
  )
})

test('a two-line subtitle inside a bar does not defeat bar detection', () => {
  // 192x108 is the size Ambilight samples; the subtitle is 10 rows tall, like two lines of text.
  const withSubtitle = frame(192, 108, (x, y) => {
    if (y >= 96 && y < 106 && x >= 40 && x < 150) return [255, 255, 255]
    return y < 14 || y >= 94 ? [0, 0, 0] : [0, 0, 255]
  })
  const bars = A.detectBars(withSubtitle, 192, 108)
  assert.equal(bars.top, 14)
  assert.equal(bars.bottom, 93)
})

test('pillarbox bars are ignored', () => {
  const pillarboxed = frame(64, 36, (x) => (x < 12 || x >= 52 ? [0, 0, 0] : [255, 0, 0]))
  const bars = A.detectBars(pillarboxed, 64, 36)
  assert.equal(bars.left, 12)
  assert.equal(bars.right, 51)
})

test('an entirely black frame yields black when ignoring bars', () => {
  const black = frame(32, 18, () => [0, 0, 0])
  assert.deepEqual(A.frameColor(black, 32, 18, { ignoreBars: true }), [0, 0, 0])
})

test('black detector has hysteresis', () => {
  const detector = A.createBlackDetector(3, 8)
  assert.equal(detector.update([1, 1, 1]), true)
  assert.equal(detector.update([5, 4, 4]), true, 'stays black while below the exit level')
  assert.equal(detector.update([9, 4, 4]), false, 'leaves black above the exit level')
  assert.equal(detector.update([5, 4, 4]), false, 'does not re-enter black until it is below the enter level')
  assert.equal(detector.update([2, 2, 2]), true)
})

test('vividify leaves neutral colors alone and boosts saturation otherwise', () => {
  assert.deepEqual(A.vividify([120, 120, 120], 80), [120, 120, 120])
  const [r, g, b] = A.vividify([200, 120, 100], 50)
  assert.ok(r - b > 200 - 100, 'channel spread should grow')
  near(r, 200, 1) // value (max channel) is preserved
  assert.ok(g >= 0 && b >= 0)
})

test('smoothing converges and zero smoothing is instant', () => {
  assert.deepEqual(A.smoothColor([0, 0, 0], [100, 50, 0], 0.016, 0), [100, 50, 0])
  const step = A.smoothColor([0, 0, 0], [100, 100, 100], 0.1, 50)
  assert.ok(step[0] > 0 && step[0] < 100)
})

test('median filter ignores a single glitch frame', () => {
  const colors = [[200, 100, 50], [0, 0, 0], [198, 101, 49]]
  assert.deepEqual(A.medianColor(colors), [198, 100, 49])
})

test('settings migration only rewrites the old defaults once', () => {
  const legacy = A.migrateSettings({ smooth: 35, hdramt: 50, mode: 'x', fps: 12 })
  assert.equal(legacy.smooth, 50)
  assert.equal(legacy.hdramt, 10)
  assert.equal(legacy.fps, 12)
  assert.equal('mode' in legacy, false)
  assert.equal(legacy.version, A.SETTINGS_VERSION)

  // The user later picks the old values on purpose; they must now survive a reload.
  const deliberate = A.migrateSettings({ ...legacy, smooth: 35, hdramt: 50 })
  assert.equal(deliberate.smooth, 35)
  assert.equal(deliberate.hdramt, 50)
})

test('settings migration tolerates garbage', () => {
  assert.equal(A.migrateSettings(null).dominant, true)
  assert.equal(A.migrateSettings('nope').fps, A.SETTINGS_DEFAULTS.fps)
})
