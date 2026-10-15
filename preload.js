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
  setScreen(index) {
    ipcRenderer.send('setScreen', index)
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
  onTrayPower(callback) {
    ipcRenderer.on('tray-power', (_event, enabled) => callback(enabled))
  },
  env() {
    return ipcRenderer.invoke('env')
  },
  onEnv(callback) {
    ipcRenderer.on('env', (_event, environment) => callback(environment))
  },
})
