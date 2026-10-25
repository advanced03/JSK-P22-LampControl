(() => {
const $ = id => document.getElementById(`ambi-${id}`);
const i18n = window.ambiI18n;
const core = window.AmbiCore;

const RECOVERY_ATTEMPTS = 6;
const SYNC_FRAME_WIDTH = 192;
const SYNC_FRAME_HEIGHT = 108;
const NO_FRAME_TIMEOUT = 6000;

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
let forceResend = false;
let calibrationRevision = 0;
let screenLocked = false;

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
  sendColor(outputColor, true);
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
  if (running) {
    // The sync loop sends the current scene color again on its next frame.
    forceResend = true;
  } else if (window.lampControl.connected) {
    window.lampControl.restoreState();
  }
}

let loopId = 0;
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

function sendColor(rgb, testColor = false) {
  if (!window.lampControl.sendColor(rgb[0], rgb[1], rgb[2], null, testColor)) {
    setStatus('status.notConnected');
    return false;
  }
  if (wizardActive) {
    $('wizard-status').textContent = '';
  }
  return true;
}

const video = $('video');
const canvas = $('cv');
const context = canvas.getContext('2d', { willReadFrequently: true });

async function startCapture(generation) {
  const sourceId = await window.api.captureSource();
  if (generation !== startGeneration) {
    return false;
  }

  const nextStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        // The sync only needs a tiny picture; asking for a small capture keeps the load on the GPU/CPU low.
        maxWidth: 480,
        maxHeight: 270,
        maxFrameRate: captureFrameRate()
      }
    }
  });
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
      // Capture cannot work while Windows is locked; wait for the unlock instead of using up the attempts.
      while (screenLocked && running && generation === startGeneration) {
        await sleep(1000);
      }
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
  loopId++;
  starting = false;
  running = false;
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
  syncLoop(++loopId);
}

async function syncLoop(id) {
  const engine = core.createEngine();
  let lastSentColor = null;
  let lastSendTime = 0;
  let lastCalibrationRevision = calibrationRevision;
  let previousFrameTime = performance.now();
  let lastFrameTime = performance.now();

  while (running && id === loopId) {
    const frameStart = performance.now();
    if (wizardActive) {
      // The wizard owns the lamp; start over afterwards so the first frame is sent right away.
      previousFrameTime = frameStart;
      lastFrameTime = frameStart;
      lastSentColor = null;
      engine.reset();
      await sleep(1000 / settings.fps);
      continue;
    }

    if (video.readyState >= 2 && video.videoWidth > 0) {
      lastFrameTime = frameStart;
      context.drawImage(video, 0, 0, SYNC_FRAME_WIDTH, SYNC_FRAME_HEIGHT);
      const image = context.getImageData(0, 0, SYNC_FRAME_WIDTH, SYNC_FRAME_HEIGHT);
      const elapsed = Math.min((frameStart - previousFrameTime) / 1000, 1);
      previousFrameTime = frameStart;
      const result = engine.step(image.data, SYNC_FRAME_WIDTH, SYNC_FRAME_HEIGHT, settings, elapsed);

      const previewColor = result.preview.map(clampByte);
      const outputColor = result.output.map(clampByte);
      $('sw').style.background = `rgb(${previewColor[0]}, ${previewColor[1]}, ${previewColor[2]})`;

      const changedEnough = !lastSentColor || outputColor.reduce(
        (difference, channel, index) => difference + Math.abs(channel - lastSentColor[index]),
        0
      ) >= 3;
      const needsRefresh = lastSentColor
        && outputColor.some((channel, index) => channel !== lastSentColor[index])
        && frameStart - lastSendTime > 1500;
      const calibrationChanged = calibrationRevision !== lastCalibrationRevision;

      if (window.lampControl.connected && (changedEnough || needsRefresh || calibrationChanged || forceResend)) {
        if (sendColor(outputColor)) {
          lastSentColor = outputColor;
          lastSendTime = frameStart;
          lastCalibrationRevision = calibrationRevision;
          forceResend = false;
        }
      }
    } else if (frameStart - lastFrameTime > NO_FRAME_TIMEOUT && !recovering && !starting) {
      // The capture stream is alive but delivers nothing; restart it.
      lastFrameTime = frameStart;
      recoverCapture();
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
    if (resumeAfterReconnect && window.lampControl.autoReconnect) {
      resumeAfterReconnect = false;
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
  screens.forEach(({ label, id, displayId }) => {
    const option = new Option(label, id);
    option.dataset.display = displayId || '';
    select.add(option);
  });
  const displayOf = (id) => (screens.find((screen) => screen.id === id) || {}).displayId || '';

  if (screens.length === 0) {
    select.disabled = true;
    return;
  }

  select.disabled = false;
  // Screen ids are positions that can shift when displays change, so the display itself is matched first.
  // The saved choice is only overwritten when the person picks a screen, so a monitor that is unplugged for
  // a while is chosen again when it comes back.
  const savedIndex = Number.isInteger(settings.screen)
    ? Math.max(0, Math.min(settings.screen, screens.length - 1))
    : -1;
  const match = (settings.display && screens.find(({ displayId }) => displayId === settings.display))
    || screens.find(({ id }) => id === settings.screen)
    || screens[savedIndex >= 0 ? savedIndex : 0];
  select.value = match.id;
  if (!settings.screen || !settings.display) {
    settings.screen = match.id;
    settings.display = displayOf(match.id);
    saveSettings();
  }
  window.api.setScreen(match.id, displayOf(match.id));
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
  settings.display = ($('screen').selectedOptions[0] || {}).dataset?.display || '';
  saveSettings();
  window.api.setScreen(settings.screen, settings.display);

  if (running) {
    const generation = ++startGeneration;
    stopCapture();
    try {
      await startCapture(generation);
    } catch (error) {
      if (generation !== startGeneration) {
        return;
      }
      stopSync();
      setStatus('status.captureFailed', { message: error.message });
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
// Locking Windows interrupts screen capture; pause recovery while locked and restart after unlocking.
window.api.onLock(() => {
  screenLocked = true;
});
window.api.onUnlock(() => {
  screenLocked = false;
  refreshScreens().catch(() => {});
  setTimeout(recoverCapture, 1500);
});

populateScreens();
})();
