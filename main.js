const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  session,
  desktopCapturer,
  nativeTheme,
  systemPreferences,
  Tray,
  Menu,
  nativeImage,
} = require('electron')
const path = require('path')
const os = require('os')
const MODE = process.env.LAMP_MODE || require('./package.json').appMode || 'control'

app.commandLine.appendSwitch('enable-web-bluetooth')
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

// Mica / Acrylic backdrops need Windows 11 22H2 (build 22621); older systems get a solid Fluent background.
const MICA = process.platform === 'win32' && parseInt(os.release().split('.')[2] || '0', 10) >= 22621
const dark = () => nativeTheme.shouldUseDarkColors
const overlay = () => ({
  color: '#00000000',
  symbolColor: dark() ? '#ffffff' : '#1a1a1a',
  height: 40,
})
const solid = () => (MICA ? '#00000000' : dark() ? '#202020' : '#f3f3f3')

function env() {
  let accent = null
  try {
    accent = systemPreferences.getAccentColor() || null
  } catch (e) {
    // Accent color is unavailable on some platforms.
  }

  return { mica: MICA, accent, dark: dark() }
}

function pushEnv() {
  for (const window of BrowserWindow.getAllWindows()) {
    try {
      window.webContents.send('env', env())
      window.setTitleBarOverlay(overlay())
      if (!MICA) window.setBackgroundColor(solid())
    } catch (e) {
      // A window may close while the system theme is changing.
    }
  }
}

nativeTheme.on('updated', pushEnv)
try {
  systemPreferences.on('accent-color-changed', pushEnv)
} catch (e) {
  // Accent color change notifications are not supported on every platform.
}

function fluent(material, extra) {
  return Object.assign(
    {
      backgroundColor: solid(),
      titleBarStyle: 'hidden',
      titleBarOverlay: overlay(),
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        backgroundThrottling: false,
      },
    },
    MICA ? { backgroundMaterial: material } : {},
    extra,
  )
}

// ---- system tray (Ambilight): closing the window hides it so sync keeps running ----
let tray = null
let trayOn = false
let quitting = false
let appState = { status: 'Not connected', running: false, connected: false }
let trayLabels = {
  open: 'Open app',
  startSync: 'Start sync',
  stopSync: 'Stop sync',
  disconnect: 'Disconnect from lamp',
  connect: 'Open to connect',
  turnOn: 'Turn lamp on',
  turnOff: 'Turn lamp off',
  quit: 'Quit',
}

function showWin() {
  if (!win) return
  win.show()
  win.focus()
}

function buildTray() {
  if (!trayOn) {
    if (tray) {
      tray.destroy()
      tray = null
    }
    return
  }

  if (!tray) {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'))
      .resize({ width: 32, height: 32 })
    tray = new Tray(icon)
    tray.on('click', showWin)
  }

  const appName = MODE === 'sync' ? 'Lamp Ambilight' : 'JSK-P22 Lamp Control'
  tray.setToolTip(appName + ': ' + appState.status)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: trayLabels.open, click: showWin },
    {
      label: MODE === 'sync'
        ? appState.running ? trayLabels.stopSync : trayLabels.startSync
        : appState.connected ? trayLabels.disconnect : trayLabels.connect,
      click: () => {
        if (MODE !== 'sync' && !appState.connected) showWin()
        else if (win) win.webContents.send('tray-toggle')
      },
    },
    ...(MODE === 'control' ? [
      { type: 'separator' },
      {
        label: trayLabels.turnOn,
        enabled: appState.connected,
        click: () => win && win.webContents.send('tray-power', true),
      },
      {
        label: trayLabels.turnOff,
        enabled: appState.connected,
        click: () => win && win.webContents.send('tray-power', false),
      },
    ] : []),
    { type: 'separator' },
    {
      label: trayLabels.quit,
      click: () => {
        quitting = true
        app.quit()
      },
    },
  ]))
}

app.on('before-quit', () => {
  quitting = true
})

let win = null
let picker = null
let pickCb = null
let lastList = []
let monitor = 0

function sendDevices() {
  if (!picker) return
  const devices = lastList.map((device) => ({
    id: device.deviceId,
    name: device.deviceName || '',
  }))
  picker.webContents.send('devices', devices)
}

function openPicker() {
  if (picker) return
  picker = new BrowserWindow(fluent('acrylic', {
    width: 400,
    height: 500,
    minWidth: 320,
    minHeight: 360,
    parent: win,
    modal: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    title: 'Choose your lamp',
  }))
  picker.loadFile('picker.html')
  picker.webContents.on('did-finish-load', sendDevices)
  picker.on('closed', () => {
    picker = null
    if (pickCb) {
      pickCb('')
      pickCb = null
    }
  })
}

function createWindow() {
  const sync = MODE === 'sync'
  win = new BrowserWindow(fluent('mica', {
    width: sync ? 560 : 1000,
    height: sync ? 900 : 740,
    minWidth: 360,
    minHeight: 480,
    title: sync ? 'Lamp Ambilight' : 'JSK-P22 Lamp Control',
    icon: path.join(__dirname, 'icon.png'),
  }))
  win.on('close', (event) => {
    if (trayOn && !quitting) {
      event.preventDefault()
      win.hide()
    }
  })
  win.loadFile(sync ? 'sync.html' : 'control.html')
  win.webContents.on('select-bluetooth-device', (event, devices, callback) => {
    event.preventDefault()
    pickCb = callback
    lastList = devices
    openPicker()
    sendDevices()
  })
}

app.whenReady().then(() => {
  const defaultSession = session.defaultSession
  defaultSession.setPermissionCheckHandler(() => true)
  defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => callback(true),
  )
  defaultSession.setDevicePermissionHandler(() => true)
  defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1, height: 1 },
    })
    callback({ video: sources[Math.min(monitor, sources.length - 1)] })
  })

  ipcMain.handle('env', () => env())
  ipcMain.handle('open-bluetooth-settings', async () => {
    await shell.openExternal('ms-settings:bluetooth')
  })
  ipcMain.on('choose', (_event, deviceId) => {
    if (pickCb) {
      pickCb(deviceId)
      pickCb = null
    }
    if (picker) {
      picker.close()
    }
  })

  ipcMain.handle('screens', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1, height: 1 },
    })
    return sources.map((source, index) => source.name || `Screen ${index + 1}`)
  })

  ipcMain.on('tray', (_event, enabled) => {
    trayOn = !!enabled
    buildTray()
  })
  ipcMain.on('tray-labels', (_event, labels) => {
    if (!labels || typeof labels !== 'object') return
    trayLabels = { ...trayLabels, ...labels }
    if (tray) buildTray()
  })
  ipcMain.on('state', (_event, state) => {
    appState = state
    if (tray) buildTray()
  })
  ipcMain.on('setScreen', (_event, index) => {
    monitor = index
  })

  createWindow()
})

app.on('window-all-closed', () => app.quit())
