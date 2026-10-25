const test = require('node:test')
const assert = require('node:assert/strict')
const P = require('../protocol.js')

test('every command is 9 bytes from 0x7E to 0xEF', () => {
  const commands = [
    P.power(true), P.power(false), P.color(1, 2, 3), P.brightness(50), P.mode(10), P.scene(3), P.speed(40),
    P.mic(true), P.eq(2), P.sensitivity(70), P.clock(new Date()), P.timerWrite(7, 30, 0, 0x9f), P.timerQuery(1),
  ]
  for (const bytes of commands) {
    assert.equal(bytes.length, 9)
    assert.equal(bytes[0], 0x7e)
    assert.equal(bytes[8], 0xef)
  }
})

test('documented examples', () => {
  assert.deepEqual(P.power(true), [0x7e, 4, 4, 1, 0, 1, 0xff, 0, 0xef])
  assert.deepEqual(P.color(255, 0, 128), [0x7e, 7, 5, 3, 255, 0, 128, 0x10, 0xef])
  assert.deepEqual(P.brightness(80), [0x7e, 4, 1, 80, 0xff, 0xff, 0xff, 0, 0xef])
})

test('values are clamped to a byte', () => {
  assert.deepEqual(P.color(-5, 300, 12.6).slice(4, 7), [0, 255, 13])
  assert.deepEqual(P.color(NaN, undefined, null).slice(4, 7), [0, 0, 0])
})

test('timer report parsing', () => {
  const report = [0x7e, 8, 0x82, 7, 30, 0, 1, 0x9f, 0xef]
  assert.deepEqual(P.parseTimerReport(report, 1), { hour: 7, minute: 30, weeks: 0x9f })
  assert.equal(P.parseTimerReport(report, 0), null)
  assert.equal(P.parseTimerReport([1, 2, 3], 0), null)
})
