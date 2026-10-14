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

  const navigation = document.querySelectorAll('.nav')
  navigation.forEach((button) => {
    button.addEventListener('click', () => {
      navigation.forEach((item) => item.classList.toggle('sel', item === button))
      document.querySelectorAll('.page').forEach((page) => {
        page.classList.toggle('on', page.id === button.dataset.page)
      })
    })
  })
})()
