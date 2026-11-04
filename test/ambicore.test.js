const test = require('node:test')
const assert = require('node:assert/strict')
const core = require('../ambicore.js')

const W = 192
const H = 108
const frame = (colorAt) => {
  const data = new Uint8ClampedArray(W * H * 4)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [r, g, b] = colorAt(x, y)
      const i = (y * W + x) * 4
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = 255
    }
  }
  return data
}
const solid = (color) => frame(() => color)
const spread = (rgb) => Math.max(...rgb) - Math.min(...rgb)

function simulate(segments, overrides = {}) {
  const settings = { ...core.SETTINGS_DEFAULTS, ...overrides }
  const engine = core.createEngine()
  const output = []
  for (const [color, seconds] of segments) {
    const data = solid(color)
    for (let i = 0; i < seconds * 20; i++) output.push(engine.step(data, W, H, settings, 0.05).output.map(Math.round))
  }
  return output
}

test('ignoring black bars measures only the picture', () => {
  const data = frame((x, y) => (y < 14 || y > 93 ? [0, 0, 0] : [100, 20, 20]))
  assert.deepEqual(core.detectBars(data, W, H), { left: 0, right: 191, top: 14, bottom: 93 })
  assert.deepEqual(core.frameColor(data, W, H, { ignoreBars: true }).map(Math.round), [100, 20, 20])
  assert.ok(core.frameColor(data, W, H, {})[0] < 80)
})

test('a subtitle inside a bar does not defeat bar detection', () => {
  const data = frame((x, y) => {
    if (y < 14 || y > 93) return y > 96 && y < 102 && x > 60 && x < 130 ? [255, 255, 255] : [0, 0, 0]
    return [20, 22, 30]
  })
  const bars = core.detectBars(data, W, H)
  assert.equal(bars.top, 14)
  assert.equal(bars.bottom, 93)
})

test('a very dark scene with bar detection on is not forced to black', () => {
  assert.deepEqual(core.frameColor(solid([5, 5, 5]), W, H, { ignoreBars: true }).map(Math.round), [5, 5, 5])
})

test('dominant colors: small accent barely tints a gray screen, large vivid area wins', () => {
  const accent = frame((x, y) => (x < 30 && y < 10 ? [217, 119, 87] : [38, 37, 34]))
  const settings = { ...core.SETTINGS_DEFAULTS, smooth: 0, dominant: true }
  assert.ok(spread(core.createEngine().step(accent, W, H, settings, 0.05).output) <= 2)
  const mostly = frame((x) => (x < 100 ? [220, 30, 30] : [120, 120, 120]))
  const plain = core.frameColor(mostly, W, H, {})
  const dominant = core.frameColor(mostly, W, H, { dominant: true })
  assert.ok(spread(dominant) > spread(plain))
})

test('gray and black scenes never produce a color tint, also while fading', () => {
  const out = simulate([[[0, 0, 0], 2], [[90, 90, 90], 2], [[0, 0, 0], 2], [[200, 200, 200], 2], [[6, 5, 4], 2]], { smooth: 50 })
  for (const rgb of out) assert.ok(spread(rgb) <= 1, `tinted output ${rgb}`)
})

test('smoothing is gradual, scales with the setting, and 0 is instant', () => {
  const step = (smooth) => {
    const out = simulate([[[200, 200, 200], 3], [[0, 0, 0], 3]], { smooth })
    let largest = 0
    for (let i = 1; i < out.length; i++) largest = Math.max(largest, Math.abs(out[i][0] - out[i - 1][0]))
    return largest
  }
  assert.ok(step(0) > 150)
  assert.ok(step(50) < 20)
  assert.ok(step(100) < step(50))
  assert.ok(core.smoothingTimeConstant(100) > core.smoothingTimeConstant(50))
})

test('the lamp is never sent anything dimmer than the minimum brightness (default 15%)', () => {
  assert.equal(core.SETTINGS_DEFAULTS.minLevel, 15)
  const out = simulate([[[0, 0, 0], 2], [[3, 3, 3], 2], [[100, 100, 100], 1], [[0, 0, 0], 3]])
  for (const rgb of out) assert.ok(Math.max(...rgb) >= core.MIN_OUTPUT_LEVEL, `too dim: ${rgb}`)
  const black = out[out.length - 1]
  assert.ok(spread(black) <= 1, 'black becomes a neutral dim white')
  const higher = simulate([[[0, 0, 0], 2]], { minLevel: 30 })
  assert.ok(Math.max(...higher[higher.length - 1]) >= 76)
  const lowest = simulate([[[0, 0, 0], 2]], { minLevel: 1 })
  assert.ok(Math.max(...lowest[lowest.length - 1]) <= 3)
  const calibrated = simulate([[[0, 0, 0], 1]], { calRed: 100, calGreen: 80, calBlue: 60 })
  const last = calibrated[calibrated.length - 1]
  assert.ok(last[0] > last[1] && last[1] > last[2])
})

test('calibration and brightness limit apply to the output but not the preview', () => {
  const settings = { ...core.SETTINGS_DEFAULTS, smooth: 0, vivid: 0, dominant: false, calRed: 50, bright: 50 }
  const result = core.createEngine().step(solid([200, 100, 100]), W, H, settings, 0.05)
  assert.deepEqual(result.preview.map(Math.round), [200, 100, 100])
  assert.deepEqual(result.output.map(Math.round), [50, 50, 50])
})

test('damaged saved settings are repaired', () => {
  const repaired = core.migrateSettings({ fps: 0, smooth: 'abc', bright: -5, version: 2 })
  assert.equal(repaired.fps, 1)
  assert.equal(repaired.smooth, core.SETTINGS_DEFAULTS.smooth)
  assert.equal(repaired.bright, 0)
  assert.equal(repaired.minLevel, 0)
  assert.equal('hdr' in repaired, false)
  assert.equal('allowTurnOff' in repaired, false)
})

test('a small bright panel on a black screen is not mistaken for a picture between black bars', () => {
  const panel = frame((x, y) => (x > 140 && y > 80 && y < 100 ? [255, 255, 255] : [0, 0, 0]))
  assert.equal(core.detectBars(panel, W, H), null)
  const average = core.frameColor(panel, W, H, { ignoreBars: true })
  assert.ok(Math.max(...average) < 40, `lamp would be ${average}`)
})


test('minimum and maximum brightness both span 0-100 and the minimum never exceeds the maximum', () => {
  const clamped = core.sanitizeSettings({ ...core.SETTINGS_DEFAULTS, minLevel: 80, bright: 50 })
  assert.equal(clamped.minLevel, 50)
  assert.equal(core.sanitizeSettings({ ...core.SETTINGS_DEFAULTS, minLevel: 100, bright: 100 }).minLevel, 100)
  const constant = simulate([[[0, 0, 0], 2], [[200, 30, 30], 2]], { minLevel: 100, bright: 100 })
  for (const rgb of constant) assert.ok(Math.max(...rgb) >= 250, `not constant: ${rgb}`)
  const black = simulate([[[0, 0, 0], 2]], { minLevel: 0 })
  assert.deepEqual(black[black.length - 1], [0, 0, 0])
  const capped = simulate([[[255, 255, 255], 2]], { minLevel: 10, bright: 40 })
  assert.ok(Math.max(...capped[capped.length - 1]) <= 103)
})

function smootherRun(values, amount, dt = 0.05) {
  const smoother = core.createSmoother()
  return values.map((value) => smoother.step([value, value, value], dt, amount)[0])
}
const range = (list, from = 0) => Math.max(...list.slice(from)) - Math.min(...list.slice(from))

test('smoothing irons out fast flicker instead of passing it through', () => {
  const flicker = Array.from({ length: 400 }, (_, i) => (Math.floor(i * 0.05 * 4) % 2 ? 200 : 60)) // 2 Hz
  assert.ok(range(smootherRun(flicker, 50), 200) < 6, 'a 60<->200 flicker must stay almost still')
  assert.ok(range(smootherRun(flicker, 0), 200) > 100, 'smoothing 0 stays raw')
})

test('a short flash is mostly ignored, a real scene change still comes through', () => {
  const flash = Array.from({ length: 160 }, (_, i) => (i >= 40 && i < 43 ? 255 : 40)) // 0.15 s
  assert.ok(Math.max(...smootherRun(flash, 50)) < 60)
  const cut = Array.from({ length: 400 }, (_, i) => (i < 40 ? 20 : 220))
  const out = smootherRun(cut, 50)
  assert.ok(out[out.length - 1] > 215, 'reaches the new scene color')
  assert.ok(out[40 + 20] < 150, 'but glides, it does not jump')
  const monotonic = out.every((value, i) => i === 0 || value >= out[i - 1] - 0.001)
  assert.ok(monotonic, 'no overshoot or wobble')
})

test('smoothing a scene change is not slower than a plain exponential filter', () => {
  const cut = Array.from({ length: 400 }, (_, i) => (i < 40 ? 20 : 220))
  const adaptive = smootherRun(cut, 50)
  let plain = [20, 20, 20]
  const exponential = cut.map((value) => (plain = core.smoothColor(plain, [value, value, value], 0.05, 50))[0])
  const reach = (list) => list.findIndex((value, i) => i >= 40 && value >= 20 + 200 * 0.9)
  assert.ok(reach(adaptive) <= reach(exponential) + 4)
})
