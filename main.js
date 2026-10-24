const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  session,
  desktopCapturer,
  nativeTheme,
  screen,
  systemPreferences,
  powerMonitor,
  Tray,
  Menu,
  nativeImage,
} = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
app.commandLine.appendSwitch('enable-web-bluetooth')
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

// The lamp accepts one Bluetooth connection, so a second copy of the app can only get in the way.
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) app.quit()
app.on('second-instance', () => showWin())

// The app only ever shows its own local pages. Refuse to navigate anywhere else or to open new windows.
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: 'deny' }))
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file:')) event.preventDefault()
  })
})

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
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
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
  if (win.isMinimized()) win.restore()
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

  tray.setToolTip('JSK-P22 Lamp Control: ' + appState.status)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: trayLabels.open, click: showWin },
    {
      label: appState.running ? trayLabels.stopSync : trayLabels.startSync,
      enabled: appState.connected,
      click: () => win && win.webContents.send('tray-sync-toggle'),
    },
    { type: 'separator' },
    {
      label: appState.connected ? trayLabels.disconnect : trayLabels.connect,
      click: () => {
        if (!appState.connected) showWin()
        else if (win) win.webContents.send('tray-toggle')
      },
    },
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

// The lamp chosen last time, remembered across restarts so auto-reconnect can pick it without a window.
const lastLampFile = () => path.join(app.getPath('userData'), 'last-lamp.json')
function loadLastLamp() {
  try {
    return JSON.parse(fs.readFileSync(lastLampFile(), 'utf8')).id || null
  } catch (e) {
    return null
  }
}
function saveLastLamp(id) {
  try {
    fs.writeFileSync(lastLampFile(), JSON.stringify({ id }))
  } catch (e) {
    // Not being able to remember the lamp only disables silent reconnect.
  }
}
let autoPick = null // { id, callback, timer } while a silent reconnect is waiting for the lamp to show up

let win = null
let picker = null
let pickCb = null
let lastList = []
let selectedScreen = ''

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
  win = new BrowserWindow(fluent('mica', {
    width: 1000,
    height: 740,
    minWidth: 360,
    minHeight: 480,
    title: 'JSK-P22 Lamp Control',
    icon: path.join(__dirname, 'icon.png'),
  }))
  win.on('close', (event) => {
    if (trayOn && !quitting) {
      event.preventDefault()
      win.hide()
    }
  })
  win.loadFile('control.html')
  win.webContents.on('select-bluetooth-device', (event, devices, callback) => {
    event.preventDefault()
    lastList = devices
    if (autoPick) {
      const wanted = autoPick.id
      if (devices.some((device) => device.deviceId === wanted)) {
        clearTimeout(autoPick.timer)
        autoPick = null
        callback(wanted)
      } else {
        autoPick.callback = callback // keep waiting; the event repeats as new devices are discovered
      }
      return
    }
    pickCb = callback
    openPicker()
    sendDevices()
  })
}

app.whenReady().then(() => {
  if (!gotLock) return
  const defaultSession = session.defaultSession
  async function getScreenSources() {
    return desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1, height: 1 },
    })
  }

  // Grant permissions (screen capture, Bluetooth) only to the app's own local pages, never to remote origins.
  const trusted = (origin) => !origin || origin === 'null' || origin.startsWith('file:')
  defaultSession.setPermissionCheckHandler((_webContents, _permission, origin, details) => (
    trusted((details && details.requestingUrl) || origin)
  ))
  defaultSession.setPermissionRequestHandler((_webContents, _permission, callback, details) => (
    callback(trusted(details && details.requestingUrl))
  ))
  defaultSession.setDevicePermissionHandler((details) => trusted(details && details.origin))

  ipcMain.handle('env', () => env())
  ipcMain.handle('open-bluetooth-settings', async () => {
    await shell.openExternal('ms-settings:bluetooth')
  })
  ipcMain.on('choose', (_event, deviceId) => {
    if (deviceId) saveLastLamp(deviceId)
    if (pickCb) {
      pickCb(deviceId)
      pickCb = null
    }
    if (picker) {
      picker.close()
    }
  })

  ipcMain.handle('screens', async () => {
    const sources = await getScreenSources()
    const displaysById = new Map(
      screen.getAllDisplays().map((display) => [String(display.id), display]),
    )

    return sources.map((source, index) => {
      const display = displaysById.get(source.display_id)
      const name = (source.name || `Display ${index + 1}`)
        .replace(/:\s*\d+\s*x\s*\d+\s*$/i, '')
      if (!display) {
        return { id: source.id, label: name }
      }

      const width = Math.round(display.bounds.width * display.scaleFactor)
      const height = Math.round(display.bounds.height * display.scaleFactor)
      return { id: source.id, label: `${name} (${width} × ${height})` }
    })
  })

  // Returns the source id plus the display's real pixel size, so the renderer can ask for a small capture
  // with the same aspect ratio. selectedScreen is deliberately not overwritten with the fallback: if the
  // chosen display is only missing for a moment, the next capture goes back to it.
  ipcMain.handle('capture-source', async () => {
    const sources = await getScreenSources()
    const source = sources.find(({ id }) => id === selectedScreen) || sources[0]
    if (!source) {
      throw new Error('No screen capture source is available.')
    }
    const display = screen.getAllDisplays().find(({ id }) => String(id) === source.display_id)
    return {
      id: source.id,
      width: display ? Math.round(display.bounds.width * display.scaleFactor) : 0,
      height: display ? Math.round(display.bounds.height * display.scaleFactor) : 0,
    }
  })

  // Silent reconnect: run the renderer's connect with a simulated user gesture (Web Bluetooth requires one)
  // while the chooser handler above auto-selects the remembered lamp.
  ipcMain.handle('auto-connect', async () => {
    const id = loadLastLamp()
    if (!id || !win || autoPick) return { attempted: false, connected: false }
    autoPick = {
      id,
      callback: null,
      timer: setTimeout(() => {
        if (autoPick) {
          if (autoPick.callback) autoPick.callback('') // cancel the request: the lamp was not found nearby
          autoPick = null
        }
      }, 12000),
    }
    try {
      const connected = await Promise.race([
        win.webContents.executeJavaScript('window.lampControl.connectAuto()', true),
        new Promise((resolve) => setTimeout(() => resolve(false), 15000)),
      ])
      return { attempted: true, connected: !!connected }
    } catch (e) {
      return { attempted: true, connected: false }
    } finally {
      if (autoPick) {
        clearTimeout(autoPick.timer)
        autoPick = null
      }
    }
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
  ipcMain.on('setScreen', (_event, screenId) => {
    if (typeof screenId !== 'string') {
      console.warn('Ignored an invalid screen selection.')
      return
    }
    selectedScreen = screenId
  })

  createWindow()

  // Screen capture can die silently when the PC sleeps or a display changes; tell the renderer to recover.
  const toWindow = (channel) => {
    if (win && !win.isDestroyed()) win.webContents.send(channel)
  }
  powerMonitor.on('resume', () => toWindow('resume'))
  screen.on('display-added', () => toWindow('display-changed'))
  screen.on('display-removed', () => toWindow('display-changed'))
  screen.on('display-metrics-changed', (_event, _display, changedMetrics) => {
    if (changedMetrics.some((metric) => metric !== 'workArea')) toWindow('display-changed')
  })
})

app.on('window-all-closed', () => app.quit())
