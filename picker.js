
    const deviceList = document.getElementById('list')
    const hint = document.getElementById('hint')
    const cancelButton = document.getElementById('cancel')
    let hasDevices = false

    function prefersLamp(device) {
      return device.name.toUpperCase().startsWith('MELK-')
    }

    function updateHint() {
      const messageKey = hasDevices ? 'picker.pickHint' : 'picker.rangeHint'
      hint.textContent = i18n.t(messageKey)
    }

    function createDeviceButton(device) {
      const button = document.createElement('button')
      const name = document.createElement('span')
      const identifier = document.createElement('small')

      name.textContent = device.name || i18n.t('picker.unnamed')
      name.dataset.unnamed = String(!device.name)
      identifier.textContent = device.id
      button.append(name, identifier)
      button.addEventListener('click', () => api.choose(device.id))

      return button
    }

    function renderDevices(devices) {
      hasDevices = devices.length > 0
      devices.sort((first, second) =>
        Number(prefersLamp(second)) - Number(prefersLamp(first)) ||
        Number(Boolean(second.name)) - Number(Boolean(first.name))
      )
      deviceList.replaceChildren()

      devices.forEach((device) => {
        deviceList.appendChild(createDeviceButton(device))
      })

      if (!hasDevices) {
        const emptyMessage = document.createElement('div')
        emptyMessage.className = 'empty'
        emptyMessage.textContent = i18n.t('picker.searching')
        deviceList.appendChild(emptyMessage)
      }

      updateHint()
    }

    function updateDeviceNames() {
      deviceList.querySelectorAll('button span[data-unnamed="true"]').forEach((name) => {
        name.textContent = i18n.t('picker.unnamed')
      })

      const emptyMessage = deviceList.querySelector('.empty')
      if (emptyMessage) {
        emptyMessage.textContent = i18n.t('picker.searching')
      }
    }

    api.onDevices(renderDevices)
    cancelButton.addEventListener('click', () => api.choose(''))
    document.addEventListener('languagechange', () => {
      updateHint()
      updateDeviceNames()
    })
    