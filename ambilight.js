(() => {
const $ = id => document.getElementById(`ambi-${id}`);
const i18n = window.ambiI18n;

const commands = {
  color: (red, green, blue) => [0x7e, 7, 5, 3, red, green, blue, 0x10, 0xef]
};

const defaultSettings = {
  bars: false,
  fps: 30,
  smooth: 35,
  vivid: 40,
  bright: 100,
  screen: '',
  hdr: false,
  hdramt: 50,
  calRed: 100,
  calGreen: 100,
  calBlue: 100
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('cfg') || '{}');
    if (saved && typeof saved === 'object') {
      delete saved.mode;
    }
    return { ...defaultSettings, ...saved };
  } catch (error) {
    console.warn('Could not read saved settings; using defaults.', error);
    return { ...defaultSettings };
  }
}

const settings = loadSettings();
for (const settingName of ['calRed', 'calGreen', 'calBlue']) {
  const value = Number(settings[settingName]);
  settings[settingName] = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : defaultSettings[settingName];
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
    'bars', 'fps', 'smooth', 'vivid', 'bright', 'hdr', 'hdramt'
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
      output.textContent = settings[id];
    }

    const updateSetting = () => {
      settings[id] = isCheckbox ? input.checked : input.type === 'range'
        ? Number(input.value)
        : input.value;
      if (output) {
        output.textContent = settings[id];
      }
      saveSettings();
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
    for (const id of ['fps', 'smooth', 'vivid', 'bright']) {
      const input = $(id);
      const value = defaultSettings[id];
      settings[id] = value;
      input.value = value;
      input.parentElement.querySelector('output').textContent = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

}

function frameColor(data, width, height, ignoreBars) {
  let left = 0;
  let right = width - 1;
  let top = 0;
  let bottom = height - 1;

  if (ignoreBars) {
    const brightestInRow = new Uint8Array(height);
    const brightestInColumn = new Uint8Array(width);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const brightness = Math.max(data[index], data[index + 1], data[index + 2]);
        brightestInRow[y] = Math.max(brightestInRow[y], brightness);
        brightestInColumn[x] = Math.max(brightestInColumn[x], brightness);
      }
    }

    top = brightestInRow.findIndex(value => value > 24);
    left = brightestInColumn.findIndex(value => value > 24);
    if (top < 0 || left < 0) {
      return [0, 0, 0];
    }

    const lastBrightRow = [...brightestInRow].reverse().findIndex(value => value > 24);
    const lastBrightColumn = [...brightestInColumn].reverse().findIndex(value => value > 24);
    bottom = height - 1 - lastBrightRow;
    right = width - 1 - lastBrightColumn;
  }

  let red = 0;
  let green = 0;
  let blue = 0;
  let pixelCount = 0;

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const index = (y * width + x) * 4;
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
      pixelCount++;
    }
  }

  return pixelCount
    ? [red / pixelCount, green / pixelCount, blue / pixelCount]
    : [0, 0, 0];
}

function vividify([red, green, blue], amount) {
  red /= 255;
  green /= 255;
  blue /= 255;

  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const value = maximum;
  const delta = maximum - minimum;
  let hue = 0;
  let saturation = maximum ? delta / maximum : 0;

  if (delta) {
    if (maximum === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (maximum === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
    hue /= 6;
    if (hue < 0) {
      hue += 1;
    }
  }

  saturation = Math.min(1, saturation * (1 + amount / 50));
  const hueSector = hue * 6;
  const sector = Math.floor(hueSector);
  const fraction = hueSector - sector;
  const low = value * (1 - saturation);
  const descending = value * (1 - fraction * saturation);
  const ascending = value * (1 - (1 - fraction) * saturation);
  const rgbBySector = [
    [value, ascending, low],
    [descending, value, low],
    [low, value, ascending],
    [low, descending, value],
    [ascending, low, value],
    [value, low, descending]
  ];

  return rgbBySector[sector % 6].map(channel => channel * 255);
}

// Windows exposes a simplified SDR version of HDR content, which can look washed out.
function correctHdr(rgb, amount) {
  const strength = amount / 100;
  const gamma = 1 + 0.8 * strength;
  const corrected = rgb.map(channel => {
    const normalized = Math.max(0, Math.min(255, channel)) / 255;
    return 255 * Math.pow(normalized, gamma);
  });
  return vividify(corrected, 30 * strength);
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
  sendCommand(commands.color(...outputColor));
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
  if (!running && wizardPreviousOutput && window.lampControl.connected) {
    sendCommand(commands.color(...wizardPreviousOutput));
  }
  wizardPreviousOutput = null;
}

// A single odd frame (a black capture hiccup, a one-frame flash) should not move the lamp,
// so the target is the per-channel median of the last few sampled colors. Cost: about one
// frame of extra delay on a real scene change.
const GLITCH_FILTER_FRAMES = 3;

function medianColor(colors) {
  return [0, 1, 2].map(channel => {
    const values = colors.map(color => color[channel]).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  });
}

function smoothColor(current, target, elapsedSeconds, amount) {
  const timeConstant = amount / 100 * 1.2;
  const blend = timeConstant < 1e-3
    ? 1
    : 1 - Math.exp(-elapsedSeconds / timeConstant);

  return current.map((channel, index) => (
    channel + (target[index] - channel) * blend
  ));
}

let running = false;
let starting = false;
let startGeneration = 0;
let stream = null;

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function sendCommand(bytes) {
  if (!window.lampControl.sendColor(...bytes.slice(4, 7))) {
    setStatus('status.notConnected');
    return;
  }
  lastOutputColor = bytes.slice(4, 7);
  if (wizardActive) {
    $('wizard-status').textContent = '';
  }
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
        maxFrameRate: 30
      }
    }
  });
  if (generation !== startGeneration) {
    nextStream.getTracks().forEach(track => track.stop());
    return false;
  }

  stopCapture();
  stream = nextStream;
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

function stopSync() {
  if (!running && !starting) {
    return;
  }

  startGeneration++;
  starting = false;
  running = false;
  stopCapture();
  $('start').textContent = i18n.translate('button.startSync');
  $('start').disabled = !window.lampControl.connected;
  window.lampControl.setAmbilightRunning(false);
}

window.ambilight = {
  stop() {
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
  const recentColors = [];

  while (running) {
    const frameStart = performance.now();
    if (wizardActive) {
      previousFrameTime = frameStart;
      recentColors.length = 0;
      await sleep(1000 / settings.fps);
      continue;
    }

    if (video.readyState >= 2) {
      context.drawImage(video, 0, 0, 192, 108);
      const image = context.getImageData(0, 0, 192, 108);
      let sampledColor = frameColor(
        image.data,
        192,
        108,
        settings.bars
      );

      if (settings.hdr) {
        sampledColor = correctHdr(sampledColor, settings.hdramt);
      }

      const vividColor = vividify(sampledColor, settings.vivid);
      recentColors.push(vividColor);
      if (recentColors.length > GLITCH_FILTER_FRAMES) {
        recentColors.shift();
      }
      currentColor = smoothColor(
        currentColor,
        medianColor(recentColors),
        (frameStart - previousFrameTime) / 1000,
        settings.smooth
      );
      previousFrameTime = frameStart;

      const previewColor = currentColor.map(channel => (
        Math.max(0, Math.min(255, Math.round(channel * settings.bright / 100)))
      ));
      const outputColor = calibrateColor(currentColor).map(channel => (
        Math.max(0, Math.min(255, Math.round(channel * settings.bright / 100)))
      ));
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

      if (window.lampControl.connected && (changedEnough || needsRefresh || calibrationChanged)) {
        sendCommand(commands.color(...outputColor));
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

  if (running) {
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
      stopSync();
    }
    if (wizardActive) {
      $('wizard-status').textContent = i18n.translate('wizard.disconnected');
    }
    setStatus('status.notConnected');
  } else if (!running) {
    setStatus('status.stopped');
    refreshWizardColors();
  }
}

async function populateScreens() {
  try {
    const screens = await window.api.screens();
    screens.forEach(({ label, id }) => {
      $('screen').add(new Option(label, id));
    });

    if (screens.length === 0) {
      $('screen').disabled = true;
      return;
    }

    const savedIndex = Number.isInteger(settings.screen)
      ? Math.max(0, Math.min(settings.screen, screens.length - 1))
      : -1;
    const selectedScreen = screens.some(({ id }) => id === settings.screen)
      ? settings.screen
      : screens[savedIndex >= 0 ? savedIndex : 0].id;
    $('screen').value = selectedScreen;
    settings.screen = selectedScreen;
    saveSettings();
    window.api.setScreen(selectedScreen);
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
  i18n.setLanguage(window.i18n.language);
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

populateScreens();
})();
