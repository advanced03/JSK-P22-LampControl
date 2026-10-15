
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

      button.type = 'button'
      button.dataset.deviceId = device.id
      name.textContent = device.name || i18n.t('picker.unnamed')
      name.dataset.unnamed = String(!device.name)
      identifier.textContent = device.id
      button.append(name, identifier)
      button.addEventListener('click', () => api.choose(device.id))

      return button
    }

    function renderDevices(devices) {
      const scrollTop = deviceList.scrollTop
      const listTop = deviceList.getBoundingClientRect().top
      const visibleDevice = [...deviceList.querySelectorAll('button[data-device-id]')].find((button) => (
        button.getBoundingClientRect().bottom > listTop
      ))
      const anchorDeviceId = visibleDevice?.dataset.deviceId
      const anchorOffset = visibleDevice
        ? visibleDevice.getBoundingClientRect().top - listTop
        : 0
      hasDevices = devices.length > 0
      const orderedDevices = [...devices].sort((first, second) =>
        Number(prefersLamp(second)) - Number(prefersLamp(first)) ||
        Number(Boolean(second.name)) - Number(Boolean(first.name))
      )
      deviceList.replaceChildren()

      orderedDevices.forEach((device) => {
        deviceList.appendChild(createDeviceButton(device))
      })

      if (!hasDevices) {
        const emptyMessage = document.createElement('div')
        emptyMessage.className = 'empty'
        emptyMessage.textContent = i18n.t('picker.searching')
        deviceList.appendChild(emptyMessage)
      }

      const anchoredDevice = anchorDeviceId
        && [...deviceList.querySelectorAll('button[data-device-id]')].find(
          (button) => button.dataset.deviceId === anchorDeviceId
        )
      deviceList.scrollTop = anchoredDevice
        ? scrollTop + anchoredDevice.getBoundingClientRect().top
          - deviceList.getBoundingClientRect().top - anchorOffset
        : scrollTop
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
    