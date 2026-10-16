// BLE command builders and parsers for the JSK-P22 / MELK lamp (decoded from the Magic Lantern app).
// Every command is 9 bytes: 0x7E ... 0xEF, written to characteristic 0xFFF3 without response.
;(function (root, factory) {
  const api = factory()
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else root.LampProtocol = api
})(typeof self !== 'undefined' ? self : this, function () {
  // The lamp clock command carries a weekday byte. The convention the firmware expects is not verified:
  // false sends JavaScript's getDay() (Sunday = 0 ... Saturday = 6); true sends ISO (Monday = 1 ... Sunday = 7).
  // If scheduled timers fire on the wrong day, flip this one constant.
  const CLOCK_WEEKDAY_ISO = false

  const WEEK_ENABLED = 0x80 // bit 7 of the timer "weeks" byte; bits 0-6 are Monday to Sunday
  const clampByte = (value) => Math.max(0, Math.min(255, Math.round(Number(value) || 0)))

  return {
    CLOCK_WEEKDAY_ISO,
    WEEK_ENABLED,
    clampByte,
    power: (on) => [0x7e, 4, 4, +!!on, 0, +!!on, 0xff, 0, 0xef],
    color: (r, g, b) => [0x7e, 7, 5, 3, clampByte(r), clampByte(g), clampByte(b), 0x10, 0xef],
    brightness: (level) => [0x7e, 4, 1, clampByte(level), 0xff, 0xff, 0xff, 0, 0xef],
    mode: (id) => [0x7e, 5, 3, clampByte(id), 6, 0xff, 0xff, 0, 0xef],
    scene: (id) => [0x7e, 5, 0x31, clampByte(id), 7, 0xff, 0xff, 1, 0xef],
    speed: (value) => [0x7e, 4, 2, clampByte(value), 0xff, 0xff, 0xff, 0, 0xef],
    mic: (on) => [0x7e, 4, 7, +!!on, 0xff, 0xff, 0xff, 0, 0xef],
    eq: (index) => [0x7e, 7, 3, clampByte(index + 128), 4, 0xff, 0xff, 0, 0xef],
    sensitivity: (value) => [0x7e, 4, 6, clampByte(value), 0xff, 0xff, 0xff, 0, 0xef],
    clock(date = new Date()) {
      const day = CLOCK_WEEKDAY_ISO ? date.getDay() || 7 : date.getDay()
      return [0x7e, 7, 0x83, date.getHours(), date.getMinutes(), date.getSeconds(), day, 0xff, 0xef]
    },
    // mode: 0 = turn on, 1 = turn off. weeks: bit 7 enables the timer, bits 0-6 are Monday to Sunday.
    timerWrite: (hour, minute, mode, weeks) => [0x7e, 8, 0x82, hour, minute, 0, mode, weeks, 0xef],
    timerQuery: (mode) => [0x7e, 8, 0x82, 255, 255, 255, mode, 0, 0xef],
    parseTimerReport(bytes, mode) {
      if (!bytes || bytes.length < 9) return null
      if (bytes[0] !== 0x7e || bytes[1] !== 8 || bytes[2] !== 0x82 || bytes[8] !== 0xef || bytes[6] !== mode) return null
      return { hour: bytes[3], minute: bytes[4], weeks: bytes[7] }
    },
  }
})
