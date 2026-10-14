# JSK-P22 Lamp Controller

A Windows desktop app for controlling JSK-P22 / MELK Bluetooth LE lamps. Set colors and brightness, use effects and
music sync, and manage the lamp clock and schedules. The resizable interface supports English, Dutch, and Simplified
Chinese; the selected language is saved locally. Windows 11 may use Mica or Acrylic window materials.

## Requirements

- Windows 10 or 11 with Bluetooth LE
- Node.js 22.12 or newer

## Run and build

```powershell
npm install
npm start
npm run build
```

The build creates a portable Windows x64 executable in `dist/`. Electron Builder embeds the app icon; the executable is
not digitally signed.

## Notes

- Change the language and optionally enable system-tray mode in Settings. With tray mode enabled, closing the window
  hides the app; use the tray menu to reopen it, disconnect, or quit.
- `appMode` in `package.json` selects the window mode (`control` by default); `LAMP_MODE` overrides it. Only
  `control.html` is included, so the `sync` mode is unavailable.
- Connect to the lamp whose Bluetooth name starts with `MELK`. Close other apps connected to it first; the lamp
  typically accepts only one connection at a time.
- `main.js` creates the windows, `preload.js` exposes the renderer API, `picker.html` displays Bluetooth devices, and
  `fluent.css` / `fluent.js` provide styling and Windows theme handling.

## Bluetooth protocol

The protocol was decoded from the Magic Lantern Android app. It uses service `0000fff0-0000-1000-8000-00805f9b34fb`
and characteristic `0000fff3-0000-1000-8000-00805f9b34fb`. Commands are 9 bytes, start with `7E`, end with `EF`, and
are written without response; there is no encryption or handshake. Examples: power `7E 04 04 v 00 v FF 00 EF`, color
`7E 07 05 03 R G B 10 EF`, brightness `7E 04 01 level FF FF FF 00 EF`.

Schedule timers use `7E 08 82 h m 00 mode weeks EF` (`mode`: 0 = on, 1 = off). In `weeks`, bit 7 enables the timer
and bits 0–6 represent Monday through Sunday. To read a timer, send `FF FF FF` for the time, wait about half a second,
then read the characteristic.