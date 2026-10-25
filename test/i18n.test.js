const test = require('node:test')
const assert = require('node:assert/strict')
const { translations, translateEffect } = require('../i18n.js')

const languages = Object.keys(translations)
const placeholders = (text) => (String(text).match(/\{\w+\}/g) || []).sort().join(',')

test('every language has every English key with the same placeholders', () => {
  for (const [key, value] of Object.entries(translations.en)) {
    if (typeof value !== 'string') continue
    for (const language of languages) {
      const text = translations[language][key]
      assert.equal(typeof text, 'string', `${language} is missing ${key}`)
      assert.equal(placeholders(text), placeholders(value), `${language} placeholders differ for ${key}`)
    }
  }
})

test('translated effect names stay unique per language', () => {
  const source = require('fs').readFileSync(require('path').join(__dirname, '..', 'control.js'), 'utf8')
  const names = [...source.matchAll(/\['([^']+)', \d+\]/g)].map((match) => match[1])
  assert.ok(names.length > 200)
  for (const language of languages) {
    const seen = new Map()
    for (const name of names) {
      const translated = translateEffect(name, language)
      assert.ok(!seen.has(translated), `${language}: "${name}" and "${seen.get(translated)}" both become "${translated}"`)
      seen.set(translated, name)
    }
  }
})
