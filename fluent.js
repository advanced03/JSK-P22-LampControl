// Applies Windows accent colour / Mica flag, slider fills and page navigation.
;(function () {
  const root = document.documentElement

  function luminance(hex) {
    const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    const linear = channels.map((value) => value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4))
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
  }

  function applyEnvironment(environment) {
    if (!environment) return

    root.dataset.mica = environment.mica ? '1' : '0'
    if (environment.accent) {
      const accent = '#' + environment.accent.slice(0, 6)
      root.style.setProperty('--accent', accent)
      root.style.setProperty('--on-accent', luminance(accent) > 0.4 ? '#000' : '#fff')
    }
  }

  window.api.env().then(applyEnvironment)
  window.api.onEnv(applyEnvironment)

  function fillSlider(slider) {
    const progress = (slider.value - slider.min) / (slider.max - slider.min) * 100
    slider.style.setProperty('--p', progress + '%')
  }

  const sliders = document.querySelectorAll('input[type=range]')
  sliders.forEach((slider) => {
    fillSlider(slider)
    slider.addEventListener('input', () => fillSlider(slider))
  })
  setTimeout(() => sliders.forEach(fillSlider), 0)

  // Sidebar behaves as a tab list: roles, selected state, and Up/Down/Home/End to move between pages.
  const navigation = Array.from(document.querySelectorAll('.nav'))
  const pages = Array.from(document.querySelectorAll('.page'))

  function selectPage(button, moveFocus) {
    navigation.forEach((item) => {
      const selected = item === button
      item.classList.toggle('sel', selected)
      item.setAttribute('aria-selected', String(selected))
      item.tabIndex = selected ? 0 : -1
    })
    pages.forEach((page) => page.classList.toggle('on', page.id === button.dataset.page))
    if (moveFocus) button.focus()
  }

  navigation.forEach((button) => {
    button.id = button.id || 'tab-' + button.dataset.page
    button.setAttribute('role', 'tab')
    button.setAttribute('aria-controls', button.dataset.page)
    const page = document.getElementById(button.dataset.page)
    if (page) {
      page.setAttribute('role', 'tabpanel')
      page.setAttribute('aria-labelledby', button.id)
    }
    button.addEventListener('click', () => selectPage(button, false))
    button.addEventListener('keydown', (event) => {
      const index = navigation.indexOf(button)
      let next = -1
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % navigation.length
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + navigation.length) % navigation.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = navigation.length - 1
      if (next < 0) return
      event.preventDefault()
      selectPage(navigation[next], true)
    })
  })
  const initial = navigation.find((item) => item.classList.contains('sel')) || navigation[0]
  if (initial) selectPage(initial, false)
})()
