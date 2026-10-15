# JSK-P22 Lamp Controller

A Windows desktop app for controlling JSK-P22 / MELK Bluetooth LE lamps. Set colors and brightness, use effects and
music sync, manage the lamp clock and schedules, and sync the lamp color to your screen with Ambilight. The resizable
interface supports English, Dutch, Simplified Chinese, French, German, Spanish, Italian, and Brazilian Portuguese; the
selected language is saved locally. Windows 11 may use Mica or Acrylic window materials.

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

## Screenshots

<img width="989" height="718" alt="{3CC36F63-38E9-45DC-B24B-7D523B326EE6}" src="https://github.com/user-attachments/assets/a3f45ba4-8c3a-4ec5-80f5-1cb25b8fda35" />

<img width="971" height="734" alt="{942C493A-DF83-4595-9B31-7369EFE2122A}" src="https://github.com/user-attachments/assets/d4f4925d-2a89-4c77-9f69-08416ccd7cb4" />

<img width="971" height="723" alt="{44BD69E5-CA6D-4CA1-83CE-8CEDBBBE29DA}" src="https://github.com/user-attachments/assets/660574ff-abe0-4aab-8adf-e2d1832713e1" />

<img width="975" height="725" alt="{23978387-298A-45BB-A731-7D25EB0A8320}" src="https://github.com/user-attachments/assets/1c7f3424-2bcf-4d80-a1e1-9165eb9f6dbb" />


## Notes

- Change the language and optionally enable system-tray mode in Settings. With tray mode enabled, closing the window
  hides the app; use the tray menu to reopen it, disconnect, or quit.
- Open **Ambilight** below **Schedule**, connect using the app's shared Connect button, choose a display, and start
  sync. The Ambilight section includes black-bar filtering, optional HDR correction, color calibration, and response
  controls. Sync shares the app's existing Bluetooth connection, so it does not open a competing lamp connection.
  Manual lamp commands stop an active screen sync so effects, music sync, and chosen colors work as expected. The
  system-tray menu has separate actions for starting or stopping Ambilight and for connecting or disconnecting.
- Ambilight starts only when requested and stops if the lamp disconnects. Its capture and calibration preferences are
  saved locally; the shared app language and tray settings remain in Settings.
- Connect to the lamp whose Bluetooth name starts with `MELK`. Close other apps connected to it first; the lamp
  typically accepts only one connection at a time.
- `main.js` creates the window and handles display capture; `preload.js` exposes the renderer API; `picker.html`
  displays Bluetooth devices; and `ambilight.js` adds screen-color processing and calibration. `fluent.css` /
  `fluent.js` provide styling and Windows theme handling.

## Bluetooth protocol

The protocol was decoded from the Magic Lantern Android app. It uses service `0000fff0-0000-1000-8000-00805f9b34fb`
and characteristic `0000fff3-0000-1000-8000-00805f9b34fb`. Commands are 9 bytes, start with `7E`, end with `EF`, and
are written without response; there is no encryption or handshake. Examples: power `7E 04 04 v 00 v FF 00 EF`, color
`7E 07 05 03 R G B 10 EF`, brightness `7E 04 01 level FF FF FF 00 EF`.

Schedule timers use `7E 08 82 h m 00 mode weeks EF` (`mode`: 0 = on, 1 = off). In `weeks`, bit 7 enables the timer
and bits 0–6 represent Monday through Sunday. To read a timer, send `FF FF FF` for the time, wait about half a second,
then read the characteristic.

## AI usage

The "Magic Lantern" app was decompiled and this project was made with AI.
