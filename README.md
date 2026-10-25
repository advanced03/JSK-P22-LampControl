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
npm test
npm run build
npm run build:installer
```

`npm run build` creates a portable Windows x64 executable in `dist/`; `npm run build:installer` creates an NSIS
installer instead, which starts faster because nothing has to be unpacked on every launch. Electron Builder embeds the
app icon; neither is digitally signed, so Windows SmartScreen may warn on first run. `npm test` needs no dependencies
and checks the Bluetooth protocol builders, the Ambilight color pipeline (black bars, dominant colors, HDR, smoothing,
the dim-scene behavior, settings repair), and that every language has every translation.

## Screenshots

<img width="989" height="718" alt="{3CC36F63-38E9-45DC-B24B-7D523B326EE6}" src="https://github.com/user-attachments/assets/a3f45ba4-8c3a-4ec5-80f5-1cb25b8fda35" />

<img width="971" height="734" alt="{942C493A-DF83-4595-9B31-7369EFE2122A}" src="https://github.com/user-attachments/assets/d4f4925d-2a89-4c77-9f69-08416ccd7cb4" />

<img width="971" height="723" alt="{44BD69E5-CA6D-4CA1-83CE-8CEDBBBE29DA}" src="https://github.com/user-attachments/assets/660574ff-abe0-4aab-8adf-e2d1832713e1" />

<img width="975" height="725" alt="{23978387-298A-45BB-A731-7D25EB0A8320}" src="https://github.com/user-attachments/assets/1c7f3424-2bcf-4d80-a1e1-9165eb9f6dbb" />

<img width="988" height="730" alt="{C25BB108-8E25-4983-BF5E-1F7CA9BE71F6}" src="https://github.com/user-attachments/assets/876d01ae-5039-46b5-9dc3-f092b859760c" />


## Ambilight

Open **Ambilight** in the sidebar, connect to the lamp with the app's shared **Connect** button, select a display, and
choose **Start sync**. The app samples the selected screen and sends a representative color to the lamp. Colors are
averaged in screen RGB so every pixel contributes evenly; **Favor dominant colors** (on by default) instead gives vivid
areas more weight while preserving the scene's overall brightness. That extra weight fades in with the amount of the
screen covered by color, so small colored UI accents do not tint an otherwise monochrome screen. Near-gray colors are
protected from strong vividness boosts. The preview shows the color before lamp calibration is applied.

Ambilight settings let you:

- Ignore black letterbox and pillarbox bars when working out the screen color. Subtitles or logos inside a bar do not
  defeat the detection.
- Apply optional HDR correction for washed-out colors.
- Calibrate red, green, and blue output independently; use the calibration wizard to compare test colors with the
  preview.
- Tune update rate, smoothing, vividness, and brightness to balance responsiveness and appearance.
- Choose whether a dark scene can turn the lamp fully off. If not, the lamp stays on at a dim, neutral white (using your
  color calibration) instead of switching to the lamp's hardware brightness, which showed up as a red or yellow tint.
  The scene color fades smoothly into and out of black; nothing jumps.

Settings are saved locally. Ambilight uses the app's existing Bluetooth connection; it does not open a separate lamp
connection. Other lamp commands stop active screen sync, and disconnecting the lamp stops capture. When system-tray
mode is enabled, the tray menu can start or stop sync.

Screen capture recovers by itself when the display changes, the PC wakes from sleep, or the capture stream ends. If the
lamp connection drops unexpectedly (for example during sleep) and automatic reconnect is on, sync resumes once the lamp
is back. A manual disconnect never restarts sync on its own.

## Notes

- Change the language and optionally enable system-tray mode in Settings. With tray mode enabled, closing the window
  hides the app; use the tray menu to reopen it, disconnect, or quit.
- Only one copy of the app can run at a time; starting a second one brings the first to the front.
- Automatic reconnect keeps retrying (backing off to 30 seconds) while the lamp is out of reach. The app remembers the
  last lamp itself, so reconnecting works after a restart without showing the device picker.
- Connect to the lamp whose Bluetooth name starts with `MELK`. Close other apps connected to it first; the lamp
  typically accepts only one connection at a time.
- `main.js` creates the window and handles display capture; `preload.js` exposes the renderer API; `control.html` /
  `control.js` implement the main lamp-control UI; and `picker.html` / `picker.js` implement Bluetooth device
  selection. `protocol.js` builds and parses lamp commands; `ambicore.js` holds the screen-color math and settings
  migration (both are pure and unit-tested); `ambilight.js` handles capture, the sync loop and calibration.
  `i18n.js` holds all text for all pages. `fluent.css` / `fluent.js` provide styling, Windows theme handling and
  sidebar navigation.
- The lamp clock command carries a weekday byte whose convention is not verified on real firmware. If scheduled timers
  fire on the wrong day, flip `CLOCK_WEEKDAY_ISO` in `protocol.js`.
- Effect names are translated from their structure (name, then colors) using each language's own word order, not by
  swapping words. To add or change a language, edit `i18n.js`; `npm test` fails if a language is missing a key, has
  different placeholders, or if two effects end up with the same translated name.

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
