const test = require('node:test')
const assert = require('node:assert/strict')
const P = require('../protocol.js')

const hex = (bytes) => bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ')

test('commands match the examples documented in the README', () => {
  assert.equal(hex(P.power(true)), '7e 04 04 01 00 01 ff 00 ef')
  assert.equal(hex(P.power(false)), '7e 04 04 00 00 00 ff 00 ef')
  assert.equal(hex(P.color(255, 128, 0)), '7e 07 05 03 ff 80 00 10 ef')
  assert.equal(hex(P.brightness(50)), '7e 04 01 32 ff ff ff 00 ef')
})

test('every command is 9 bytes, starts with 0x7E and ends with 0xEF', () => {
  const commands = [
    P.power(true), P.color(1, 2, 3), P.brightness(5), P.mode(12), P.scene(4), P.speed(9), P.mic(true),
    P.eq(3), P.sensitivity(40), P.clock(new Date(2026, 9, 16, 8, 30, 15)), P.timerWrite(7, 30, 0, 0x9f), P.timerQuery(1),
  ]
  for (const command of commands) {
    assert.equal(command.length, 9)
    assert.equal(command[0], 0x7e)
    assert.equal(command[8], 0xef)
    assert.ok(command.every((byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255))
  }
})

test('out-of-range values are clamped instead of wrapping around', () => {
  assert.deepEqual(P.color(300, -5, 12.6).slice(4, 7), [255, 0, 13])
  assert.equal(P.brightness(999)[3], 255)
})

test('clock sends hours, minutes, seconds and a weekday byte', () => {
  const friday = new Date(2026, 9, 16, 8, 30, 15) // Friday 16 October 2026
  const bytes = P.clock(friday)
  assert.deepEqual(bytes.slice(3, 6), [8, 30, 15])
  assert.equal(bytes[6], P.CLOCK_WEEKDAY_ISO ? 5 : 5)
  const sunday = P.clock(new Date(2026, 9, 18, 0, 0, 0))
  assert.equal(sunday[6], P.CLOCK_WEEKDAY_ISO ? 7 : 0)
})

test('timer reports are parsed and validated', () => {
  const report = [0x7e, 8, 0x82, 7, 30, 0, 1, 0x9f, 0xef]
  assert.deepEqual(P.parseTimerReport(report, 1), { hour: 7, minute: 30, weeks: 0x9f })
  assert.equal(P.parseTimerReport(report, 0), null) // wrong mode
  assert.equal(P.parseTimerReport([0x7e, 8, 0x82], 1), null) // too short
  assert.equal(P.parseTimerReport([0, 8, 0x82, 7, 30, 0, 1, 0, 0xef], 1), null) // bad header
})

test('timer write puts the enable flag in bit 7 of the weeks byte', () => {
  const weeks = 0b0011111 | P.WEEK_ENABLED // Monday to Friday, enabled
  assert.equal(hex(P.timerWrite(7, 5, 0, weeks)), '7e 08 82 07 05 00 00 9f ef')
})
