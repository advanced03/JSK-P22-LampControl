// Runs the real ambicore.js + ambilight.js inside a vm with a fake DOM / lamp / capture stack.
const vm = require('vm')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const CHECKBOXES = new Set(['bars', 'dominant', 'allowTurnOff', 'hdr'])
const RANGES = new Set(['fps', 'smooth', 'vivid', 'bright', 'hdramt', 'cal-red', 'cal-green', 'cal-blue',
  'wizard-cal-red', 'wizard-cal-green', 'wizard-cal-blue'])

function makeHarness(options = {}) {
  const storage = new Map()
  if (options.cfg) storage.set('cfg', JSON.stringify(options.cfg))
  const elements = {}
  const log = { colors: [], brightness: [], stateRunning: [], statuses: [] }

  function makeElement(name) {
    const listeners = {}
    const output = { textContent: '' }
    const el = {
      name,
      type: CHECKBOXES.has(name) ? 'checkbox' : RANGES.has(name) ? 'range' : 'text',
      value: '',
      checked: false,
      disabled: false,
      min: '0',
      max: '100',
      textContent: '',
      style: { setProperty() {}, background: '' },
      options: [],
      parentElement: { querySelector: () => output },
      addEventListener(type, fn) { (listeners[type] ||= []).push(fn) },
      dispatchEvent(event) { (listeners[event.type] || []).forEach((fn) => fn(event)); return true },
      emit(type) { (listeners[type] || []).forEach((fn) => fn({ type })) },
      click() { if (!el.disabled) el.emit('click') },
      setAttribute() {},
      add(option) { el.options.push(option) },
      replaceChildren() { el.options = [] },
      showModal() { el.open = true },
      close() { el.open = false; el.emit('close') },
      play: async () => {},
      getContext: () => ({
        drawImage() {},
        getImageData: () => ({ data: harness.frame }),
      }),
    }
    if (name === 'video') {
      el.readyState = 2
      el.srcObject = null
    }
    return el
  }

  const document = {
    getElementById(id) {
      const name = id.replace(/^ambi-/, '')
      return (elements[name] ||= makeElement(name))
    },
    addEventListener() {},
  }

  const W = 192, H = 108
  const harness = {
    elements,
    log,
    storage,
    frame: new Uint8ClampedArray(W * H * 4),
    setScene(r, g, b) {
      for (let i = 0; i < W * H; i++) {
        harness.frame[i * 4] = r
        harness.frame[i * 4 + 1] = g
        harness.frame[i * 4 + 2] = b
        harness.frame[i * 4 + 3] = 255
      }
    },
    lamp: { connected: true, brightness: 80, poweredOff: false, autoReconnect: true, disconnectedManually: false },
    screensResult: options.screens || [{ id: 'screen:0:0', label: 'A' }, { id: 'screen:1:0', label: 'B' }],
    setScreenCalls: [],
    connectionCb: null,
  }
  harness.setScene(...(options.scene || [200, 40, 40]))

  const stream = {
    getVideoTracks: () => [{ readyState: 'live', addEventListener() {}, applyConstraints: async () => {} }],
    getTracks: () => [{ stop() {} }],
  }
  const constraintsSeen = []
  harness.constraintsSeen = constraintsSeen

  const lampControl = {
    get connected() { return harness.lamp.connected },
    get brightness() { return harness.lamp.brightness },
    get poweredOff() { return harness.lamp.poweredOff },
    get autoReconnect() { return harness.lamp.autoReconnect },
    get disconnectedManually() { return harness.lamp.disconnectedManually },
    sendColor(r, g, b, brightness = null) {
      log.colors.push({ rgb: [r, g, b], brightness, t: Date.now() })
      if (brightness !== null) log.brightness.push(brightness)
      return true
    },
    sendBrightness(level) {
      log.brightness.push(level)
      return true
    },
    onConnectionChange(cb) { harness.connectionCb = cb; cb(true, 'connected') },
    setAmbilightRunning(running) { log.stateRunning.push(running) },
  }

  const sandbox = {
    document,
    console: { ...console, warn() {}, error() {} },
    performance,
    setTimeout, clearTimeout, setInterval, clearInterval,
    Promise, Math, Number, Array, Float32Array, Uint16Array, Object, Set, Map, JSON, Error, Event: class { constructor(type) { this.type = type } },
    Option: class { constructor(label, id) { this.label = label; this.value = id } },
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
    },
    navigator: {
      mediaDevices: {
        getUserMedia: async (constraints) => { constraintsSeen.push(constraints); return stream },
      },
    },
  }
  sandbox.self = sandbox
  sandbox.window = sandbox
  sandbox.lampControl = lampControl
  sandbox.i18n = { language: 'en' }
  sandbox.ambiI18n = { translate: (key) => key, setLanguage() {} }
  sandbox.api = {
    screens: async () => harness.screensResult,
    captureSource: async () => ({ id: 'screen:0:0', width: 2560, height: 1440 }),
    setScreen: (id) => harness.setScreenCalls.push(id),
    onDisplayChange: (cb) => { harness.displayChange = cb },
    onResume: (cb) => { harness.resume = cb },
  }

  const context = vm.createContext(sandbox)
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'ambicore.js'), 'utf8'), context, { filename: 'ambicore.js' })
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'ambilight.js'), 'utf8'), context, { filename: 'ambilight.js' })

  harness.ambilight = () => context.ambilight
  harness.context = context
  return harness
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
module.exports = { makeHarness, sleep }
