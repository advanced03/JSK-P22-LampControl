(() => {
const $ = id => document.getElementById(`ambi-${id}`);
const i18n = window.ambiI18n;
const core = window.AmbiCore;

const RECOVERY_ATTEMPTS = 6;
const SYNC_FRAME_WIDTH = 192;
const SYNC_FRAME_HEIGHT = 108;
// The lamp color is averaged from a 192x108 sample, so there is no point in making Windows hand over (and the
// renderer read back) a full 1440p/4K frame 20+ times per second; that readback is what costs frames in games.
const CAPTURE_MAX_WIDTH = 640;
const CAPTURE_MAX_HEIGHT = 360;

function loadSettings() {
  try {
    return core.migrateSettings(JSON.parse(localStorage.getItem('cfg') || '{}'));
  } catch (error) {
    console.warn('Could not read saved settings; using defaults.', error);
    return core.migrateSettings({});
  }
}

const settings = loadSettings();
for (const settingName of ['calRed', 'calGreen', 'calBlue']) {
  const value = Number(settings[settingName]);
  settings[settingName] = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : core.SETTINGS_DEFAULTS[settingName];
}
let statusKey = 'status.notConnected';
let statusValues = {};
const calibrationControls = [
  ['cal-red', 'calRed'],
  ['cal-green', 'calGreen'],
  ['cal-blue', 'calBlue']
];
const calibrationTests = [
  { color: 'pink', rgb: [255, 48, 128] },
  { color: 'orange', rgb: [255, 96, 32] },
  { color: 'yellow', rgb: [220, 190, 32] },
  { color: 'cyan', rgb: [32, 190, 220] },
  { color: 'purple', rgb: [150, 48, 220] }
];
let wizardActive = false;
let wizardStep = 0;
let wizardPreviousOutput = null;
let lastOutputColor = null;
let calibrationRevision = 0;
let minimumWhiteActive = false;
// Set when sync stopped while the lamp was parked at 1% brightness but the lamp could not be reached.
let restoreBrightnessOnConnect = false;

// Undoes the "white at 1%" black-scene state: sync changes the lamp brightness itself, so whenever it stops
// (or is stopped by another command) the brightness the person chose has to be put back.
function restoreLampBrightness() {
  if (!minimumWhiteActive) {
    return;
  }
  minimumWhiteActive = false;
  if (!window.lampControl.sendBrightness(window.lampControl.brightness)) {
    restoreBrightnessOnConnect = true;
  }
}

function setStatus(key, values = {}) {
  statusKey = key;
  statusValues = values;
  $('sync-status').textContent = i18n.translate(key, values);
}

function saveSettings() {
  try {
    localStorage.setItem('cfg', JSON.stringify(settings));
  } catch (error) {
    console.error('Could not save settings.', error);
  }
}

function setCalibrationValue(settingName, value) {
  settings[settingName] = value;
  calibrationRevision++;
  const control = calibrationControls.find(([, name]) => name === settingName);
  if (control) {
    const [id] = control;
    for (const inputId of [id, `wizard-${id}`]) {
      const input = $(inputId);
      if (!input) {
        continue;
      }
      input.value = value;
      const output = input.parentElement.querySelector('output');
      if (output) {
        output.textContent = `${value}%`;
      }
      const minimum = Number(input.min);
      const maximum = Number(input.max);
      input.style.setProperty(
        '--p',
        `${(value - minimum) / (maximum - minimum) * 100}%`
      );
    }
  }
  saveSettings();
  refreshWizardColors();
}

function bindSettings() {
  const settingIds = [
    'bars', 'dominant',
    'fps', 'smooth', 'vivid', 'bright', 'allowTurnOff', 'hdr', 'hdramt'
  ];

  for (const id of settingIds) {
    const input = $(id);
    const isCheckbox = input.type === 'checkbox';
    const output = input.parentElement.querySelector('output');

    if (isCheckbox) {
      input.checked = settings[id];
    } else {
      input.value = settings[id];
    }

    if (output) {
      output.textContent = `${settings[id]}`;
    }

    const updateSetting = () => {
      settings[id] = isCheckbox ? input.checked : input.type === 'range'
        ? Number(input.value)
        : input.value;
      if (output) {
        output.textContent = `${settings[id]}`;
      }
      saveSettings();
      if (id === 'fps') {
        applyCaptureFrameRate();
      }
    };

    input.addEventListener('input', updateSetting);
    input.addEventListener('change', updateSetting);
  }

  for (const [id, settingName] of calibrationControls) {
    const input = $(id);
    const output = input.parentElement.querySelector('output');
    input.value = settings[settingName];
    output.textContent = `${settings[settingName]}%`;

    const updateCalibration = () => setCalibrationValue(settingName, Number(input.value));
    input.addEventListener('input', updateCalibration);
    input.addEventListener('change', updateCalibration);
  }

  $('reset-calibration').addEventListener('click', () => {
    for (const [, settingName] of calibrationControls) {
      setCalibrationValue(settingName, 100);
    }
  });

  $('reset-response').addEventListener('click', () => {
    for (const id of ['fps', 'smooth', 'vivid', 'bright', 'allowTurnOff']) {
      const input = $(id);
      const value = core.SETTINGS_DEFAULTS[id];
      settings[id] = value;
      if (input.type === 'checkbox') {
        input.checked = value;
      } else {
        input.value = value;
        input.parentElement.querySelector('output').textContent = value;
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

function calibrateColor([red, green, blue]) {
  return [
    red * settings.calRed / 100,
    green * settings.calGreen / 100,
    blue * settings.calBlue / 100
  ];
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function formatHexColor(rgb) {
  return `#${rgb.map(channel => clampByte(channel).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function refreshWizardColors() {
  if (!wizardActive) {
    return;
  }

  const test = calibrationTests[wizardStep];
  const referenceColor = test.rgb.map(channel => clampByte(channel * settings.bright / 100));
  const outputColor = calibrateColor(test.rgb).map(channel => (
    clampByte(channel * settings.bright / 100)
  ));

  $('wizard-reference').style.background = `rgb(${referenceColor.join(', ')})`;
  $('wizard-sent').style.background = `rgb(${outputColor.join(', ')})`;
  const referenceHex = formatHexColor(referenceColor);
  const outputHex = formatHexColor(outputColor);
  $('wizard-reference-value').textContent = referenceHex;
  $('wizard-sent-value').textContent = outputHex;
  $('wizard-reference').setAttribute(
    'aria-label',
    `${i18n.translate('wizard.reference')}: ${referenceHex}`
  );
  $('wizard-sent').setAttribute(
    'aria-label',
    `${i18n.translate('wizard.sent')}: ${outputHex}`
  );
  sendColor(outputColor, minimumWhiteActive ? window.lampControl.brightness : null);
}

function renderWizardStep() {
  const test = calibrationTests[wizardStep];
  $('wizard-progress').textContent = i18n.translate('wizard.progress', {
    current: wizardStep + 1,
    total: calibrationTests.length
  });
  $('wizard-step-title').textContent = i18n.translate(`wizard.color.${test.color}`);
  $('wizard-step-description').textContent = i18n.translate(
    `wizard.color.${test.color}Description`
  );
  $('wizard-previous').disabled = wizardStep === 0;
  $('wizard-next').textContent = i18n.translate(
    wizardStep === calibrationTests.length - 1 ? 'wizard.finish' : 'wizard.next'
  );
  refreshWizardColors();
}

function openCalibrationWizard() {
  if (!window.lampControl.connected) {
    setStatus('wizard.noConnection');
    return;
  }

  wizardActive = true;
  wizardStep = 0;
  $('wizard-status').textContent = '';
  wizardPreviousOutput = lastOutputColor ? [...lastOutputColor] : null;
  for (const [id, settingName] of calibrationControls) {
    const input = $(`wizard-${id}`);
    input.value = settings[settingName];
    input.parentElement.querySelector('output').textContent = `${settings[settingName]}%`;
    input.style.setProperty(
      '--p',
      `${(settings[settingName] - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`
    );
    input.oninput = () => setCalibrationValue(settingName, Number(input.value));
    input.onchange = () => setCalibrationValue(settingName, Number(input.value));
  }
  $('calibration-wizard').showModal();
  renderWizardStep();
}

function closeCalibrationWizard() {
  if (!wizardActive) {
    return;
  }

  wizardActive = false;
  minimumWhiteActive = false;
  if (!running && wizardPreviousOutput && window.lampControl.connected) {
    sendColor(wizardPreviousOutput);
  }
  wizardPreviousOutput = null;
}

// A single odd frame (a black capture hiccup, a one-frame flash) should not move the lamp,
// so the target is the per-channel median of the last few sampled colors. Cost: about one
// frame of extra delay on a real scene change.
const GLITCH_FILTER_FRAMES = 3;

let running = false;
let starting = false;
let recovering = false;
let resumeAfterReconnect = false;
let startGeneration = 0;
let stream = null;

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

// Capturing faster than the sync rate only costs GPU/CPU (noticeable in games), so follow the sync rate.
function captureFrameRate() {
  return Math.max(5, Math.min(30, Math.ceil(Number(settings.fps) || 20)));
}

function applyCaptureFrameRate() {
  if (!stream) {
    return;
  }
  for (const track of stream.getVideoTracks()) {
    track.applyConstraints({ frameRate: { max: captureFrameRate() } }).catch(() => {});
  }
}

function sendColor(rgb, brightness = null) {
  if (!window.lampControl.sendColor(rgb[0], rgb[1], rgb[2], brightness)) {
    setStatus('status.notConnected');
    return;
  }
  lastOutputColor = [...rgb];
  if (wizardActive) {
    $('wizard-status').textContent = '';
  }
}

const video = $('video');
const canvas = $('cv');
const context = canvas.getContext('2d', { willReadFrequently: true });

// Largest capture size that keeps the display's aspect ratio (so no letterboxing is added) within the caps.
function captureSizeLimits(source) {
  const width = Number(source && source.width);
  const height = Number(source && source.height);
  if (!(width > 0 && height > 0)) {
    return null;
  }
  const scale = Math.min(1, CAPTURE_MAX_WIDTH / width, CAPTURE_MAX_HEIGHT / height);
  const even = value => Math.max(2, Math.round(value * scale / 2) * 2);
  return { maxWidth: even(width), maxHeight: even(height) };
}

async function startCapture(generation) {
  const source = await window.api.captureSource();
  const sourceId = typeof source === 'string' ? source : source.id;
  if (generation !== startGeneration) {
    return false;
  }

  const openStream = sizeLimits => navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        maxFrameRate: captureFrameRate(),
        ...sizeLimits
      }
    }
  });
  const sizeLimits = typeof source === 'string' ? null : captureSizeLimits(source);
  let nextStream;
  try {
    nextStream = await openStream(sizeLimits || {});
  } catch (error) {
    if (!sizeLimits) {
      throw error;
    }
    // Some drivers refuse a size limit; capture at full size rather than not at all.
    nextStream = await openStream({});
  }
  if (generation !== startGeneration) {
    nextStream.getTracks().forEach(track => track.stop());
    return false;
  }

  stopCapture();
  stream = nextStream;
  // The track ends by itself when the display goes away or its mode changes; recover instead of freezing.
  nextStream.getVideoTracks().forEach(track => {
    track.addEventListener('ended', () => {
      if (stream === nextStream) {
        recoverCapture();
      }
    });
  });
  video.srcObject = stream;
  await video.play();
  if (generation !== startGeneration) {
    if (stream === nextStream) {
      stopCapture();
    }
    return false;
  }
  return true;
}

function stopCapture() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  stream = null;
  video.srcObject = null;
}

// Restarts screen capture after the display changed, the PC woke from sleep, or the stream ended.
async function recoverCapture() {
  if (!running || recovering) {
    return;
  }

  recovering = true;
  const generation = ++startGeneration;
  setStatus('status.recovering');
  stopCapture();
  let lastError = null;
  try {
    for (let attempt = 0; attempt < RECOVERY_ATTEMPTS; attempt++) {
      await sleep(Math.min(1000 * 2 ** attempt, 8000));
      if (!running || generation !== startGeneration) {
        return;
      }
      try {
        await refreshScreens();
        if (generation !== startGeneration) {
          return;
        }
        if (await startCapture(generation)) {
          setStatus('status.syncing');
          return;
        }
      } catch (error) {
        lastError = error;
      }
    }
    stopSync();
    setStatus('status.captureFailed', { message: lastError ? lastError.message : '' });
  } finally {
    recovering = false;
  }
}

// Safety net: if the stream died without an event, notice within a couple of seconds.
setInterval(() => {
  if (!running || recovering || starting) {
    return;
  }
  const tracks = stream ? stream.getVideoTracks() : [];
  if (!stream || tracks.length === 0 || tracks.every(track => track.readyState === 'ended')) {
    recoverCapture();
  }
}, 2000);

function stopSync() {
  if (!running && !starting) {
    return;
  }

  startGeneration++;
  starting = false;
  running = false;
  restoreLampBrightness();
  stopCapture();
  $('start').textContent = i18n.translate('button.startSync');
  $('start').disabled = !window.lampControl.connected;
  window.lampControl.setAmbilightRunning(false);
}

window.ambilight = {
  stop() {
    resumeAfterReconnect = false;
    if (!running && !starting) {
      return;
    }
    stopSync();
    setStatus('status.stopped');
  }
};

function beginSync() {
  running = true;
  $('start').textContent = i18n.translate('button.stopSync');
  window.lampControl.setAmbilightRunning(true);
  setStatus('status.syncing');
  syncLoop();
}

async function syncLoop() {
  let currentColor = [0, 0, 0];
  let lastSentColor = null;
  let lastSendTime = 0;
  let lastCalibrationRevision = calibrationRevision;
  let previousFrameTime = performance.now();
  let wasBlack = false;
  let haveColor = false;
  const blackDetector = core.createBlackDetector();
  const recentColors = [];

  while (running) {
    const frameStart = performance.now();
    if (wizardActive) {
      previousFrameTime = frameStart;
      recentColors.length = 0;
      // The wizard overwrites the lamp color with its test colors. Forget what was last sent so the first
      // frame after the wizard closes always writes the scene color again, even if the scene never changed.
      lastSentColor = null;
      haveColor = false;
      await sleep(1000 / settings.fps);
      continue;
    }

    if (video.readyState >= 2) {
      context.drawImage(video, 0, 0, SYNC_FRAME_WIDTH, SYNC_FRAME_HEIGHT);
      const image = context.getImageData(0, 0, SYNC_FRAME_WIDTH, SYNC_FRAME_HEIGHT);
      let sampledColor = core.frameColor(image.data, SYNC_FRAME_WIDTH, SYNC_FRAME_HEIGHT, {
        ignoreBars: settings.bars,
        dominant: settings.dominant
      });

      if (settings.hdr) {
        sampledColor = core.correctHdr(sampledColor, settings.hdramt);
      }

      const vividColor = core.grayGuard(core.vividify(sampledColor, settings.vivid));
      recentColors.push(vividColor);
      if (recentColors.length > GLITCH_FILTER_FRAMES) {
        recentColors.shift();
      }
      const targetColor = core.medianColor(recentColors);
      const isBlack = blackDetector.update(targetColor);
      if (isBlack) {
        currentColor = [0, 0, 0];
      } else if (wasBlack || !haveColor) {
        // First frame (or leaving a black scene): jump straight to the scene color instead of fading up from black.
        currentColor = targetColor;
      } else {
        currentColor = core.smoothColor(
          currentColor,
          targetColor,
          (frameStart - previousFrameTime) / 1000,
          settings.smooth
        );
      }
      wasBlack = isBlack;
      haveColor = true;
      previousFrameTime = frameStart;

      const previewColor = currentColor.map(channel => clampByte(channel * settings.bright / 100));
      let outputColor = calibrateColor(currentColor).map(channel => (
        clampByte(channel * settings.bright / 100)
      ));
      let outputBrightness = null;
      const keepWhiteAtBlack = !settings.allowTurnOff && isBlack;
      if (keepWhiteAtBlack) {
        outputColor = [255, 255, 255];
        if (!minimumWhiteActive) {
          outputBrightness = 1;
          minimumWhiteActive = true;
        }
      } else if (minimumWhiteActive) {
        outputBrightness = window.lampControl.brightness;
        minimumWhiteActive = false;
      }
      $('sw').style.background = `rgb(${previewColor[0]}, ${previewColor[1]}, ${previewColor[2]})`;

      const changedEnough = !lastSentColor || outputColor.reduce(
        (difference, channel, index) => (
          difference + Math.abs(channel - lastSentColor[index])
        ),
        0
      ) >= 3;
      const needsRefresh = lastSentColor
        && outputColor.some((channel, index) => channel !== lastSentColor[index])
        && frameStart - lastSendTime > 1500;
      const calibrationChanged = calibrationRevision !== lastCalibrationRevision;

      if (window.lampControl.connected && (
        changedEnough || needsRefresh || calibrationChanged || outputBrightness !== null
      )) {
        sendColor(outputColor, outputBrightness);
        lastSentColor = outputColor;
        lastSendTime = frameStart;
        lastCalibrationRevision = calibrationRevision;
      }
    }

    const frameDuration = performance.now() - frameStart;
    await sleep(Math.max(0, 1000 / settings.fps - frameDuration));
  }
}

async function toggleSync() {
  if (wizardActive) {
    return;
  }

  if (!window.lampControl.connected) {
    setStatus('status.notConnected');
    return;
  }

  if (window.lampControl.poweredOff) {
    setStatus('status.lampOff');
    return;
  }

  if (running) {
    resumeAfterReconnect = false;
    stopSync();
    setStatus('status.stopped');
    return;
  }

  if (starting) {
    return;
  }

  const generation = ++startGeneration;
  starting = true;
  $('start').disabled = true;
  try {
    if (!await startCapture(generation) || generation !== startGeneration) {
      return;
    }
  } catch (error) {
    if (generation !== startGeneration) {
      return;
    }
    starting = false;
    stopCapture();
    $('start').disabled = !window.lampControl.connected;
    setStatus('status.captureFailed', { message: error.message });
    return;
  }

  starting = false;
  $('start').disabled = !window.lampControl.connected;
  beginSync();
}

function updateHdrControls() {
  $('hdramt').disabled = !settings.hdr;
}

function updateConnection(connected, status) {
  $('connection-status').textContent = status;
  $('start').disabled = !connected;
  if (!connected) {
    if (running || starting) {
      // After an unexpected drop (sleep, out of range), sync resumes by itself once auto-reconnect succeeds.
      resumeAfterReconnect = !window.lampControl.disconnectedManually;
      stopSync();
    }
    if (wizardActive) {
      $('wizard-status').textContent = i18n.translate('wizard.disconnected');
    }
    setStatus('status.notConnected');
  } else {
    if (!running) {
      setStatus('status.stopped');
      refreshWizardColors();
    }
    if (restoreBrightnessOnConnect) {
      restoreBrightnessOnConnect = false;
      window.lampControl.sendBrightness(window.lampControl.brightness);
    }
    // This runs on every status change while connected; the resume request is single-use, so it cannot fire
    // later (for example after auto-reconnect is switched on) for a drop that happened long ago.
    const shouldResume = resumeAfterReconnect && window.lampControl.autoReconnect;
    resumeAfterReconnect = false;
    if (shouldResume) {
      setTimeout(() => {
        if (!running && !starting && window.lampControl.connected) {
          toggleSync();
        }
      }, 1500);
    }
  }
}

async function refreshScreens() {
  const screens = await window.api.screens();
  const select = $('screen');
  select.replaceChildren();
  screens.forEach(({ label, id }) => {
    select.add(new Option(label, id));
  });

  if (screens.length === 0) {
    select.disabled = true;
    return;
  }

  select.disabled = false;
  const legacyIndex = Number.isInteger(settings.screen)
    ? Math.max(0, Math.min(settings.screen, screens.length - 1))
    : -1;
  const selectedScreen = screens.some(({ id }) => id === settings.screen)
    ? settings.screen
    : screens[legacyIndex >= 0 ? legacyIndex : 0].id;
  select.value = selectedScreen;
  // Only a first run (nothing saved) or an old numeric index is pinned to a concrete screen. A saved screen
  // that is missing right now (display asleep, unplugged, mode switch) stays the preference, so sync returns
  // to it by itself instead of being moved to the first display for good.
  if (typeof settings.screen !== 'string' || settings.screen === '') {
    settings.screen = selectedScreen;
    saveSettings();
  }
  window.api.setScreen(selectedScreen);
}

async function populateScreens() {
  try {
    await refreshScreens();
  } catch (error) {
    setStatus('status.screensFailed', { message: error.message });
  }
}

bindSettings();
updateHdrControls();
$('hdr').addEventListener('change', updateHdrControls);
$('hdrnote').textContent = i18n.translate('hdr.manualNote');

$('start').addEventListener('click', toggleSync);
$('open-calibration-wizard').addEventListener('click', openCalibrationWizard);
$('wizard-cancel').addEventListener('click', () => $('calibration-wizard').close());
$('wizard-previous').addEventListener('click', () => {
  if (wizardStep > 0) {
    wizardStep--;
    renderWizardStep();
  }
});
$('wizard-next').addEventListener('click', () => {
  if (wizardStep === calibrationTests.length - 1) {
    $('calibration-wizard').close();
    return;
  }
  wizardStep++;
  renderWizardStep();
});
$('calibration-wizard').addEventListener('close', closeCalibrationWizard);

window.lampControl.onConnectionChange(updateConnection);
i18n.setLanguage(window.i18n.language);
document.addEventListener('languagechange', () => {
  setStatus(statusKey, statusValues);
  if (wizardActive) {
    renderWizardStep();
  }
  $('hdrnote').textContent = i18n.translate('hdr.manualNote');
  $('start').textContent = i18n.translate(running ? 'button.stopSync' : 'button.startSync');
});

$('screen').addEventListener('change', async () => {
  settings.screen = $('screen').value;
  saveSettings();
  window.api.setScreen(settings.screen);

  if (running) {
    const generation = ++startGeneration;
    // While the new capture opens there is briefly no stream; keep the 2-second watchdog from treating that
    // gap as a dead stream (it would cancel this restart and make everything wait for a full recovery).
    starting = true;
    stopCapture();
    try {
      await startCapture(generation);
    } catch (error) {
      if (generation !== startGeneration) {
        return;
      }
      stopSync();
      setStatus('status.captureFailed', { message: error.message });
    } finally {
      if (generation === startGeneration) {
        starting = false;
      }
    }
  }
});

// Display topology changes and waking from sleep can silently kill the capture stream.
let displayChangeTimer = null;
window.api.onDisplayChange(() => {
  clearTimeout(displayChangeTimer);
  displayChangeTimer = setTimeout(() => {
    refreshScreens().catch(() => {});
    recoverCapture();
  }, 1500);
});
window.api.onResume(() => {
  refreshScreens().catch(() => {});
  setTimeout(recoverCapture, 2000);
});

populateScreens();
})();
