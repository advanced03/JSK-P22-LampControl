const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { translations, translateEffect } = require('../i18n.js')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const sources = ['control.html', 'picker.html', 'control.js', 'picker.js', 'ambilight.js'].map(read).join('\n')
const languages = Object.keys(translations)
const others = languages.filter((language) => language !== 'en')
const textKeys = (language) => Object.keys(translations[language]).filter((key) => !['effectWords', 'effectSpec'].includes(key))
const placeholders = (text) => (text.match(/\{\w+\}/g) || []).sort().join(',')

test('every language defines exactly the English keys', () => {
  const english = textKeys('en')
  for (const language of others) {
    const keys = textKeys(language)
    assert.deepEqual(english.filter((key) => !keys.includes(key)), [], `${language}: missing keys`)
    assert.deepEqual(keys.filter((key) => !english.includes(key)), [], `${language}: keys not in English`)
  }
})

test('no empty strings and placeholders match English', () => {
  for (const language of languages) {
    for (const key of textKeys(language)) {
      const text = translations[language][key]
      assert.equal(typeof text, 'string', `${language}.${key}`)
      assert.ok(text.trim().length > 0, `${language}.${key} is empty`)
      assert.equal(placeholders(text), placeholders(translations.en[key]), `${language}.${key}: placeholders differ`)
    }
  }
})

test('terminal punctuation follows the English string', () => {
  for (const language of others) {
    for (const key of textKeys(language)) {
      const english = translations.en[key]
      const text = translations[language][key]
      const englishDot = /\.$/.test(english)
      const dot = /[.。]$/.test(text)
      if (englishDot) assert.ok(dot || /[…!?！？]$/.test(text), `${language}.${key} should end with a period`)
      else if (!/…$/.test(english)) assert.ok(!dot, `${language}.${key} should not end with a period`)
    }
  }
})

test('descriptions are written as full sentences in English', () => {
  for (const key of textKeys('en')) {
    if (/(Description|Hint|Note|Intro)$|\.description$|\.intro$/.test(key)) {
      assert.match(translations.en[key], /[.…!?]$/, `${key} should end with punctuation`)
    }
  }
})

test('German uses the formal "Sie" everywhere', () => {
  const informal = /\b(du|dich|dir|dein\w*|deine\w*)\b|^(Stimme|Passe|Verbinde|Schalte|Prüfe|Gleiche|Wähle|Starte|Öffne) /
  const offenders = textKeys('de').filter((key) => informal.test(translations.de[key]))
  assert.deepEqual(offenders, [], offenders.map((key) => `${key}: ${translations.de[key]}`).join('\n'))
})

test('every key used in the pages and scripts exists', () => {
  const english = new Set(textKeys('en'))
  const used = new Set()
  for (const match of sources.matchAll(/data-i18n(?:-title)?="([\w.]+)"/g)) used.add(match[1])
  for (const match of sources.matchAll(/data-ambi-i18n(?:-aria-label)?="([\w.]+)"/g)) used.add('ambi.' + match[1])
  for (const match of sources.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const entry of match[1].split(';')) used.add(entry.split(':')[1])
  }
  for (const match of sources.matchAll(/\bi18n\.t\(\s*'([\w.]+)'/g)) used.add(match[1])
  for (const match of sources.matchAll(/\b(?:setConnectionStatus|say|setStatus|reportConnectionError)\(\s*'([\w.]+)'/g)) {
    used.add(match[1].startsWith('status.') || match[1].startsWith('wizard.') ? match[1] : match[1])
  }
  const ambiTranslate = [...sources.matchAll(/(?:i18n\.translate|setStatus)\(\s*'([\w.]+)'/g)].map((match) => 'ambi.' + match[1])
  const completedAtRuntime = (key) => [...english].some((candidate) => candidate.startsWith(key) || candidate.startsWith('ambi.' + key))
  const missing = [...used, ...ambiTranslate].filter((key) => !english.has(key) && !english.has('ambi.' + key) && !completedAtRuntime(key))
  assert.deepEqual([...new Set(missing)], [])
})

test('no translation key is dead', () => {
  const dynamicPrefixes = [...sources.matchAll(/['"`]([\w.]+)\$\{/g)].map((match) => match[1])
    .concat([...sources.matchAll(/\bt\(\s*['"]([\w.]+)['"]\s*\+/g)].map((match) => match[1]))
  const dead = textKeys('en').filter((key) => {
    const bare = key.replace(/^ambi\./, '')
    if (key === 'languageName') return false // read by i18n.js to fill the language selector
    if (dynamicPrefixes.some((prefix) => key.startsWith(prefix) || bare.startsWith(prefix))) return false
    return !sources.includes(`'${key}'`) && !sources.includes(`"${key}"`) && !sources.includes(`'${bare}'`) &&
      !sources.includes(`"${bare}"`) && !sources.includes(`:${key}`) && !sources.includes(`\`${key}\``)
  })
  assert.deepEqual(dead, [])
})

// ---- effect names

function effectNames() {
  const code = read('control.js')
  const list = new Function(code.slice(code.indexOf('const G = '), code.indexOf('const SERVICE')) + '; return G')()
  return list.flatMap(([, effects]) => effects.map(([name]) => name))
}

test('every effect base name is translated in every language', () => {
  for (const language of others) {
    const words = translations[language].effectWords
    for (const name of effectNames()) {
      const base = name.replace(/ \(alt\)$/, '').split(':')[0].trim()
      assert.ok(words[base], `${language}: no translation for effect "${base}"`)
    }
  }
})

test('translated effect names keep no English color words and stay distinct', () => {
  for (const language of others) {
    const own = Object.values(translations[language].effectSpec.colors).map((word) => word.toLowerCase())
    const leftovers = ['red', 'green', 'blue', 'yellow', 'cyan', 'purple', 'white', 'multicolor', 'dot', 'six colors']
      .filter((word) => !own.includes(word)) // e.g. French "cyan" is the same word
    const english = new RegExp('\\b(' + leftovers.join('|') + ')\\b', 'i')
    const seen = new Map()
    for (const name of effectNames()) {
      const translated = translateEffect(name, language)
      assert.doesNotMatch(translated, english, `${language}: "${name}" -> "${translated}"`)
      assert.ok(!seen.has(translated), `${language}: "${name}" and "${seen.get(translated)}" both become "${translated}"`)
      seen.set(translated, name)
    }
  }
})

test('effect names are built with proper grammar', () => {
  assert.equal(translateEffect('Running: red dot on white', 'de'), 'Lauflicht: Rotpunkt auf Weiß')
  assert.equal(translateEffect('Running: red dot on white', 'fr'), 'Défilement : point rouge sur blanc')
  assert.equal(translateEffect('Running: red dot on white', 'zh-CN'), '跑动：白底红点')
  assert.equal(translateEffect('Running: red dot on white', 'nl'), 'Lopend: rode stip op wit')
  assert.equal(translateEffect('Fade: red and yellow', 'es'), 'Fundido: rojo y amarillo')
  assert.equal(translateEffect('Transition: six colors to red', 'it'), 'Transizione: sei colori verso rosso')
  assert.equal(translateEffect('Running: red dot on white', 'en'), 'Running: red dot on white')
})
