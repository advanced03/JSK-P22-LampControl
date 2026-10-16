// Pure color and settings logic for Ambilight, kept free of DOM access so it can be unit-tested.
;(function (root, factory) {
  const api = factory()
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else root.AmbiCore = api
})(typeof self !== 'undefined' ? self : this, function () {
  const SETTINGS_VERSION = 2
  const BAR_LEVEL = 24 // a pixel brighter than this (0-255) counts as picture, not letterbox
  const NEUTRAL_SATURATION_THRESHOLD = 0.15
  const NEUTRAL_CHANNEL_SPREAD_THRESHOLD = 12
  const BLACK_ENTER_LEVEL = 3
  const BLACK_EXIT_LEVEL = 8

  const toLinear = new Float32Array(256)
  for (let i = 0; i < 256; i++) {
    const v = i / 255
    toLinear[i] = v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }

  function toSrgb(linear) {
    const v = Math.max(0, Math.min(1, linear))
    return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)
  }

  const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

  // Finds the picture area inside black letterbox / pillarbox bars. A row or column counts as picture only
  // when a few percent of its pixels are bright, and the picture only starts after a sustained run of such
  // rows, so a subtitle, logo or noise inside a bar does not defeat the detection.
  function detectBars(data, width, height) {
    const rowCount = new Uint16Array(height)
    const colCount = new Uint16Array(width)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        if (Math.max(data[i], data[i + 1], data[i + 2]) > BAR_LEVEL) {
          rowCount[y]++
          colCount[x]++
        }
      }
    }
    const rowIsPicture = (y) => rowCount[y] > Math.max(2, width * 0.04)
    const colIsPicture = (x) => colCount[x] > Math.max(2, height * 0.04)
    const rowRun = Math.max(3, Math.round(height * 0.12))
    const colRun = Math.max(3, Math.round(width * 0.12))

    function firstRun(length, isPicture, run, fromEnd) {
      for (let start = 0; start <= length - run; start++) {
        let ok = true
        for (let k = 0; k < run; k++) {
          const index = fromEnd ? length - 1 - (start + k) : start + k
          if (!isPicture(index)) {
            ok = false
            break
          }
        }
        if (ok) return start
      }
      return -1
    }

    const top = firstRun(height, rowIsPicture, rowRun, false)
    const left = firstRun(width, colIsPicture, colRun, false)
    if (top < 0 || left < 0) return null
    const bottom = height - 1 - firstRun(height, rowIsPicture, rowRun, true)
    const right = width - 1 - firstRun(width, colIsPicture, colRun, true)
    return { left, right, top, bottom }
  }

  // Representative color of a captured frame (RGBA data, 0-255 per channel).
  // Pixels are averaged in linear light, which is how light actually mixes. With dominant: true, vivid
  // pixels count more than gray ones so the result is not a muddy average; the overall brightness still
  // follows the plain average of the scene.
  function frameColor(data, width, height, options = {}) {
    let left = 0
    let right = width - 1
    let top = 0
    let bottom = height - 1
    if (options.ignoreBars) {
      const bars = detectBars(data, width, height)
      if (!bars) return [0, 0, 0]
      ;({ left, right, top, bottom } = bars)
    }

    let plainR = 0, plainG = 0, plainB = 0
    let weightedR = 0, weightedG = 0, weightedB = 0, weightTotal = 0
    let count = 0
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const i = (y * width + x) * 4
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const lr = toLinear[r], lg = toLinear[g], lb = toLinear[b]
        plainR += lr
        plainG += lg
        plainB += lb
        count++
        if (options.dominant) {
          const max = Math.max(r, g, b)
          const saturation = max ? (max - Math.min(r, g, b)) / max : 0
          const weight = 0.1 + 0.9 * saturation * (max / 255)
          weightedR += lr * weight
          weightedG += lg * weight
          weightedB += lb * weight
          weightTotal += weight
        }
      }
    }
    if (!count) return [0, 0, 0]

    const plain = [plainR / count, plainG / count, plainB / count]
    let result = plain
    if (options.dominant && weightTotal > 0) {
      const weighted = [weightedR / weightTotal, weightedG / weightTotal, weightedB / weightTotal]
      const weightedLum = luminance(...weighted)
      if (weightedLum > 1e-6) {
        let scale = luminance(...plain) / weightedLum
        const peak = Math.max(...weighted) * scale
        if (peak > 1) scale /= peak
        result = weighted.map((channel) => channel * scale)
      }
    }
    return result.map(toSrgb)
  }

  function isNearNeutral(rgb) {
    const maximum = Math.max(...rgb)
    const minimum = Math.min(...rgb)
    return maximum - minimum <= Math.max(NEUTRAL_CHANNEL_SPREAD_THRESHOLD, maximum * NEUTRAL_SATURATION_THRESHOLD)
  }

  // Raises HSV saturation by amount (0-100) while leaving near-gray colors alone. Input and output are 0-255.
  function vividify(rgb, amount) {
    if (isNearNeutral(rgb)) return [...rgb]
    const [red, green, blue] = rgb.map((channel) => channel / 255)
    const maximum = Math.max(red, green, blue)
    const minimum = Math.min(red, green, blue)
    const delta = maximum - minimum
    let hue = 0
    if (delta) {
      if (maximum === red) hue = ((green - blue) / delta) % 6
      else if (maximum === green) hue = (blue - red) / delta + 2
      else hue = (red - green) / delta + 4
      hue /= 6
      if (hue < 0) hue += 1
    }
    const saturation = Math.min(1, (maximum ? delta / maximum : 0) * (1 + amount / 50))
    const value = maximum
    const hueSector = hue * 6
    const sector = Math.floor(hueSector)
    const fraction = hueSector - sector
    const low = value * (1 - saturation)
    const descending = value * (1 - fraction * saturation)
    const ascending = value * (1 - (1 - fraction) * saturation)
    const table = [
      [value, ascending, low],
      [descending, value, low],
      [low, value, ascending],
      [low, descending, value],
      [ascending, low, value],
      [value, low, descending],
    ]
    return table[sector % 6].map((channel) => channel * 255)
  }

  // Windows hands over a simplified SDR version of HDR content, which can look washed out.
  // This is a hand-tuned gamma and saturation adjustment, not a real tone-mapping inverse.
  function correctHdr(rgb, amount) {
    const strength = amount / 100
    const gamma = 1 + 0.8 * strength
    const corrected = rgb.map((channel) => 255 * Math.pow(Math.max(0, Math.min(255, channel)) / 255, gamma))
    return vividify(corrected, 30 * strength)
  }

  function medianColor(colors) {
    return [0, 1, 2].map((channel) => {
      const values = colors.map((color) => color[channel]).sort((a, b) => a - b)
      return values[Math.floor(values.length / 2)]
    })
  }

  function smoothColor(current, target, elapsedSeconds, amount) {
    const timeConstant = (amount / 100) * 1.2
    const blend = timeConstant < 1e-3 ? 1 : 1 - Math.exp(-elapsedSeconds / timeConstant)
    return current.map((channel, index) => channel + (target[index] - channel) * blend)
  }

  // Black-scene detector with hysteresis: it turns on when every channel is very dark and only turns off
  // once the picture is clearly brighter, so fades and sensor noise around the threshold do not flicker.
  function createBlackDetector(enter = BLACK_ENTER_LEVEL, exit = BLACK_EXIT_LEVEL) {
    let black = false
    return {
      update(color) {
        const peak = Math.max(...color)
        black = black ? peak <= exit : peak <= enter
        return black
      },
      get active() {
        return black
      },
      reset() {
        black = false
      },
    }
  }

  const SETTINGS_DEFAULTS = {
    version: SETTINGS_VERSION,
    bars: false,
    dominant: true,
    fps: 20,
    smooth: 50,
    vivid: 40,
    bright: 100,
    allowTurnOff: true,
    screen: '',
    hdr: false,
    hdramt: 10,
    calRed: 100,
    calGreen: 100,
    calBlue: 100,
  }

  // One-time upgrade of saved settings. The old defaults (smooth 35, HDR 50) are replaced only while the
  // stored settings predate versioning, so a value chosen deliberately afterwards is never overwritten.
  function migrateSettings(saved) {
    const settings = saved && typeof saved === 'object' ? { ...saved } : {}
    if (!(Number(settings.version) >= 2)) {
      if (settings.smooth === 35) settings.smooth = SETTINGS_DEFAULTS.smooth
      if (settings.hdramt === 50) settings.hdramt = SETTINGS_DEFAULTS.hdramt
    }
    for (const obsolete of ['mode', 'captureMode', 'expressiveSensitivity', 'expressiveStrength', 'minimumBrightness']) {
      delete settings[obsolete]
    }
    settings.version = SETTINGS_VERSION
    return { ...SETTINGS_DEFAULTS, ...settings }
  }

  return {
    SETTINGS_VERSION,
    SETTINGS_DEFAULTS,
    detectBars,
    frameColor,
    isNearNeutral,
    vividify,
    correctHdr,
    medianColor,
    smoothColor,
    createBlackDetector,
    migrateSettings,
    toLinear,
    toSrgb,
  }
})
