// Pure color and settings logic for Ambilight, independent of the UI and screen-capture lifecycle.
;(function (root, factory) {
  const api = factory()
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else root.AmbiCore = api
})(typeof self !== 'undefined' ? self : this, function () {
  const SETTINGS_VERSION = 3
  // A pixel brighter than this (0-255) counts as picture, not letterbox. Kept just above the black-scene
  // exit level so a dark but real scene is never mistaken for bars (and then cropped or turned black).
  const BAR_LEVEL = 10
  const NEUTRAL_SATURATION_THRESHOLD = 0.15
  const NEUTRAL_CHANNEL_SPREAD_THRESHOLD = 12
  const DOMINANT_COVERAGE_START = 0.03
  const DOMINANT_COVERAGE_FULL = 0.15
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
    // Real black bars leave most of the frame as the picture. A small bright area on an otherwise black screen
    // (a dialog, a HUD, a test pattern) is content, not a picture surrounded by bars; measuring only that area
    // would make the lamp far brighter than the screen.
    const pictureWidth = right - left + 1
    const pictureHeight = bottom - top + 1
    if (pictureWidth < width * 0.5 || pictureHeight < height * 0.5 || pictureWidth * pictureHeight < width * height * 0.4) {
      return null
    }
    return { left, right, top, bottom }
  }

  // Representative color of a captured frame (RGBA data, 0-255 per channel). The ordinary average is
  // computed in screen RGB so each pixel has equal influence; dominant mode separately weights vivid pixels.
  function frameColor(data, width, height, options = {}) {
    let left = 0
    let right = width - 1
    let top = 0
    let bottom = height - 1
    if (options.ignoreBars) {
      // No clear picture area (very dark scene or nothing but bars): use the whole frame, which is then
      // simply dark, instead of forcing pure black.
      const bars = detectBars(data, width, height)
      if (bars) ({ left, right, top, bottom } = bars)
    }

    let plainR = 0, plainG = 0, plainB = 0
    let linearR = 0, linearG = 0, linearB = 0
    let weightedR = 0, weightedG = 0, weightedB = 0, weightTotal = 0
    let chromaticCount = 0
    let count = 0
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const i = (y * width + x) * 4
        const r = data[i], g = data[i + 1], b = data[i + 2]
        plainR += r
        plainG += g
        plainB += b
        count++
        if (options.dominant) {
          const lr = toLinear[r], lg = toLinear[g], lb = toLinear[b]
          linearR += lr
          linearG += lg
          linearB += lb
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const saturation = max ? (max - min) / max : 0
          if (
            saturation > NEUTRAL_SATURATION_THRESHOLD
            && max - min > NEUTRAL_CHANNEL_SPREAD_THRESHOLD
          ) {
            chromaticCount++
          }
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
    if (!options.dominant || weightTotal === 0) return plain

    const linearPlain = [linearR / count, linearG / count, linearB / count]
    let result = linearPlain
    if (weightTotal > 0) {
      const weighted = [weightedR / weightTotal, weightedG / weightTotal, weightedB / weightTotal]
      const weightedLum = luminance(...weighted)
      if (weightedLum > 1e-6) {
        let scale = luminance(...linearPlain) / weightedLum
        const peak = Math.max(...weighted) * scale
        if (peak > 1) scale /= peak
        const dominant = weighted.map((channel) => channel * scale)
        const coverage = chromaticCount / count
        const progress = Math.max(0, Math.min(
          1,
          (coverage - DOMINANT_COVERAGE_START)
            / (DOMINANT_COVERAGE_FULL - DOMINANT_COVERAGE_START)
        ))
        const strength = progress * progress * (3 - 2 * progress)
        result = linearPlain.map((channel, index) => (
          channel + (dominant[index] - channel) * strength
        ))
      }
    }
    return result.map(toSrgb)
  }

  // Raises HSV saturation smoothly, avoiding strong color shifts in near-gray scenes. Input and output are 0-255.
  function vividify(rgb, amount) {
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
    const originalSaturation = maximum ? delta / maximum : 0
    const neutralThreshold = maximum
      ? Math.max(NEUTRAL_CHANNEL_SPREAD_THRESHOLD / (maximum * 255), NEUTRAL_SATURATION_THRESHOLD)
      : 1
    const boostProgress = Math.max(0, Math.min(
      1,
      (originalSaturation - neutralThreshold) / 0.12
    ))
    // Dark colors are the least reliable: a few levels of tint are noise or UI accents, not scene color.
    // Fade the boost in with brightness so dim scenes are never pushed towards orange or yellow.
    const brightnessProgress = Math.max(0, Math.min(1, (maximum - 0.06) / 0.25))
    const smoothBoost = boostProgress * boostProgress * (3 - 2 * boostProgress)
      * brightnessProgress * brightnessProgress * (3 - 2 * brightnessProgress)
    const saturation = Math.min(
      1,
      originalSaturation * (1 + (amount / 50) * smoothBoost)
    )
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

  // Pulls near-gray colors to true gray. The pull is continuous (no threshold to flip across) and stronger
  // for dark colors, where a few levels of channel difference are mostly noise or UI accents and would
  // otherwise show up as a random warm tint on the lamp.
  function grayGuard(rgb) {
    const peak = Math.max(...rgb)
    const chroma = peak - Math.min(...rgb)
    const dark = Math.max(0, Math.min(1, (140 - peak) / 100))
    const low = 4 + 6 * dark
    const high = 12 + 18 * dark
    const progress = Math.max(0, Math.min(1, (chroma - low) / (high - low)))
    const keep = progress * progress * (3 - 2 * progress)
    const mean = (rgb[0] + rgb[1] + rgb[2]) / 3
    return rgb.map((channel) => mean + (channel - mean) * keep)
  }

  // Returns the sampled color with the median brightness. Unlike a per-channel median it never invents a
  // hue that was not in any frame, while still ignoring a single odd frame.
  function medianColor(colors) {
    const sorted = [...colors].sort((a, b) => luminance(...a) - luminance(...b))
    return sorted[Math.floor(sorted.length / 2)]
  }

  // Time constant (seconds) of the exponential smoothing for a 0-100 setting: 0 = no smoothing,
  // 50 is about 1.1 s, 100 is about 3 s. Based on elapsed time, so it does not depend on the frame rate.
  function smoothingTimeConstant(amount) {
    const fraction = Math.max(0, Math.min(100, Number(amount) || 0)) / 100
    return fraction <= 0 ? 0 : 0.08 + Math.pow(fraction, 1.5) * 3
  }

  function smoothColor(current, target, elapsedSeconds, amount) {
    const timeConstant = smoothingTimeConstant(amount)
    const blend = timeConstant < 1e-3 ? 1 : 1 - Math.exp(-Math.max(0, elapsedSeconds) / timeConstant)
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

  const GLITCH_FILTER_FRAMES = 3

  // Smoothing that irons out flicker instead of only slowing everything down.
  //  - "reference" is the color the lamp is heading for. It follows the scene slowly, so a color that keeps
  //    flipping back and forth (flashes, flicker, fast animation) averages out to its middle instead of passing through.
  //  - A real scene change is recognized when the new color stays put (within CUT_DISTANCE of itself) for a short
  //    confirmation time. Then the reference jumps to it and the lamp glides over faster than usual.
  //  - The shown color glides to the reference with an exponential curve, so changes start and end softly.
  // The "smoothing" setting scales all the times: 0 sends the raw color, 100 is the calmest.
  const CUT_DISTANCE = 0.2
  const colorDistance = (a, b) => Math.max(...a.map((channel, index) => Math.abs(channel - b[index]))) / 255
  const approach = (from, to, seconds, timeConstant) => {
    const blend = timeConstant < 1e-3 ? 1 : 1 - Math.exp(-Math.max(0, seconds) / timeConstant)
    return from.map((channel, index) => channel + (to[index] - channel) * blend)
  }

  function createSmoother() {
    let current = null
    let reference = null
    let pending = null
    let pendingTime = 0
    return {
      reset() {
        current = null
        reference = null
        pending = null
        pendingTime = 0
      },
      step(target, elapsedSeconds, amount) {
        const timeConstant = smoothingTimeConstant(amount)
        if (!current || timeConstant < 1e-3) {
          current = [...target]
          reference = [...target]
          pending = null
          pendingTime = 0
          return current
        }
        const seconds = Math.max(0, elapsedSeconds)
        const fraction = Math.max(0, Math.min(1, (Number(amount) || 0) / 100))
        const confirmTime = 0.2 + 0.8 * fraction
        let jumped = false
        if (colorDistance(target, reference) > CUT_DISTANCE) {
          if (!pending || colorDistance(target, pending) > CUT_DISTANCE * 0.6) {
            pending = [...target]
            pendingTime = 0
          } else {
            pendingTime += seconds
          }
          if (pendingTime >= confirmTime) {
            reference = [...target]
            pending = null
            pendingTime = 0
            jumped = true
          }
        } else {
          pending = null
          pendingTime = 0
        }
        if (!jumped) reference = approach(reference, target, seconds, timeConstant * 2)
        const glide = colorDistance(current, reference) > 0.25 ? timeConstant * 0.6 : timeConstant
        current = approach(current, reference, seconds, glide)
        return current
      },
    }
  }
  // The lamp cannot show correct colors below roughly 15% brightness: at that level and lower even pure white turns
  // yellow/orange. So the lamp is never sent anything dimmer than this, which also means it never goes fully dark.
  // Below this raw peak (0-255) the color of a scene is mostly capture noise, so it is blended to neutral white.
  const NEUTRAL_BELOW = 16
  const DEFAULT_MIN_LEVEL_PERCENT = 15
  const MIN_OUTPUT_LEVEL = Math.floor((DEFAULT_MIN_LEVEL_PERCENT / 100) * 255)

  // Turns the smoothed screen color into what is sent to the lamp: calibration, brightness limit and the minimum
  // brightness. Everything stays a plain color command; the lamp's hardware brightness is never used.
  function createOutputStage() {
    return {
      reset() {},
      map(color, settings) {
        const floor = (Math.min(Number(settings.minLevel), Number(settings.bright)) / 100) * 255
        const scale = (Number(settings.bright) || 0) / 100
        const cal = [settings.calRed, settings.calGreen, settings.calBlue].map((value) => (Number(value) || 0) / 100)
        const scaled = color.map((channel, index) => channel * cal[index] * scale)
        const peak = Math.max(...scaled)
        if (!(floor > 0.5) || peak >= floor) return scaled
        // Below the minimum the scene color is lifted to the minimum. Only the brightness changes: hue and saturation stay.
        // The calibrated neutral white is blended in only for scenes that are almost black, where the color is mostly
        // noise. That blend must not depend on the minimum itself, or a high minimum would wash out every dark color.
        const whitePeak = Math.max(...cal, 1e-6)
        const neutral = cal.map((value) => (value / whitePeak) * floor)
        if (peak <= 1e-6) return neutral
        const lifted = scaled.map((channel) => channel * (floor / peak))
        const mix = Math.min(1, Math.max(...color) / NEUTRAL_BELOW)
        return neutral.map((channel, index) => channel + (lifted[index] - channel) * mix)
      },
    }
  }

  // Complete frame-to-lamp pipeline with its state (glitch filter, smoothing, output stage).
  function createEngine() {
    const smoother = createSmoother()
    const recent = []
    const output = createOutputStage()
    return {
      reset() {
        smoother.reset()
        recent.length = 0
        output.reset()
      },
      // data: RGBA frame. Returns { preview, output } with channels in 0-255 (not yet rounded).
      step(data, width, height, settings, elapsedSeconds) {
        const sampled = frameColor(data, width, height, { ignoreBars: settings.bars, dominant: settings.dominant })
        recent.push(grayGuard(vividify(sampled, settings.vivid)))
        if (recent.length > GLITCH_FILTER_FRAMES) recent.shift()
        const target = medianColor(recent)
        const current = smoother.step(target, elapsedSeconds, settings.smooth)
        return { preview: current, output: output.map(current, settings) }
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
    minLevel: DEFAULT_MIN_LEVEL_PERCENT,
    screen: '',
    display: '',
    calRed: 100,
    calGreen: 100,
    calBlue: 100,
  }

  // One-time upgrade of saved settings. The old default (smooth 35) is replaced only while the stored settings
  // predate versioning, so a value chosen deliberately afterwards is never overwritten.
  function migrateSettings(saved) {
    const settings = saved && typeof saved === 'object' ? { ...saved } : {}
    if (!(Number(settings.version) >= 2)) {
      if (settings.smooth === 35) settings.smooth = SETTINGS_DEFAULTS.smooth
    }
    // Version 3: the lamp can no longer be turned fully off by the sync (it cannot show correct colors that dim),
    // and the minimum brightness setting starts at 15% for everyone.
    if (!(Number(settings.version) >= 3)) delete settings.minLevel
    for (const obsolete of [
      'mode', 'captureMode', 'expressiveSensitivity', 'expressiveStrength', 'minimumBrightness',
      'allowTurnOff', 'lowRed', 'lowGreen', 'lowBlue', 'hdr', 'hdramt',
    ]) {
      delete settings[obsolete]
    }
    settings.version = SETTINGS_VERSION
    return sanitizeSettings({ ...SETTINGS_DEFAULTS, ...settings })
  }

  // Forces every value into its valid range and type, so a damaged or hand-edited saved setting (for example
  // an update rate of 0) can never make the sync loop spin or send invalid colors.
  function sanitizeSettings(settings) {
    const ranges = {
      fps: [1, 30], smooth: [0, 100], vivid: [0, 100], bright: [0, 100],
      calRed: [0, 100], calGreen: [0, 100], calBlue: [0, 100], minLevel: [0, 100],
    }
    const result = { ...settings }
    for (const [name, [low, high]] of Object.entries(ranges)) {
      const value = Number(result[name])
      result[name] = Number.isFinite(value)
        ? Math.max(low, Math.min(high, value))
        : SETTINGS_DEFAULTS[name]
    }
    for (const name of ['bars', 'dominant']) {
      result[name] = typeof result[name] === 'boolean' ? result[name] : SETTINGS_DEFAULTS[name]
    }
    // The minimum brightness can never be above the maximum.
    if (result.minLevel > result.bright) result.minLevel = result.bright
    if (typeof result.screen !== 'string' && !Number.isInteger(result.screen)) result.screen = ''
    if (typeof result.display !== 'string') result.display = ''
    return result
  }

  return {
    SETTINGS_VERSION,
    SETTINGS_DEFAULTS,
    detectBars,
    frameColor,
    vividify,
    grayGuard,
    medianColor,
    smoothColor,
    createSmoother,
    smoothingTimeConstant,
    createBlackDetector,
    createOutputStage,
    createEngine,
    sanitizeSettings,
    MIN_OUTPUT_LEVEL,
    migrateSettings,
    toLinear,
    toSrgb,
  }
})
