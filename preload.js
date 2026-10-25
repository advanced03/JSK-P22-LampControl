const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  onDevices(callback) {
    ipcRenderer.on('devices', (_event, devices) => callback(devices))
  },
  choose(deviceId) {
    ipcRenderer.send('choose', deviceId)
  },
  openBluetoothSettings() {
    return ipcRenderer.invoke('open-bluetooth-settings')
  },
  screens() {
    return ipcRenderer.invoke('screens')
  },
  captureSource() {
    return ipcRenderer.invoke('capture-source')
  },
  setScreen(screenId, displayId) {
    ipcRenderer.send('setScreen', screenId, displayId)
  },
  manualPick() {
    ipcRenderer.send('manual-pick')
  },
  onLock(callback) {
    ipcRenderer.on('lock', () => callback())
  },
  onUnlock(callback) {
    ipcRenderer.on('unlock', () => callback())
  },
  setTray(enabled) {
    ipcRenderer.send('tray', enabled)
  },
  setTrayLabels(labels) {
    ipcRenderer.send('tray-labels', labels)
  },
  state(appState) {
    ipcRenderer.send('state', appState)
  },
  onTrayToggle(callback) {
    ipcRenderer.on('tray-toggle', () => callback())
  },
  onTraySyncToggle(callback) {
    ipcRenderer.on('tray-sync-toggle', () => callback())
  },
  onTrayPower(callback) {
    ipcRenderer.on('tray-power', (_event, enabled) => callback(enabled))
  },
  autoConnect() {
    return ipcRenderer.invoke('auto-connect')
  },
  onResume(callback) {
    ipcRenderer.on('resume', () => callback())
  },
  onDisplayChange(callback) {
    ipcRenderer.on('display-changed', () => callback())
  },
  env() {
    return ipcRenderer.invoke('env')
  },
  onEnv(callback) {
    ipcRenderer.on('env', (_event, environment) => callback(environment))
  },
})
