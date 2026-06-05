// Modified by konlyzx (2026) - Linked dashboard states, upload streams, and dynamic tab events
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

// DOM Core Elements
const recordTabBtn = document.getElementById('recordTabBtn');
const recordScreenBtn = document.getElementById('recordScreenBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const statusText = document.getElementById('statusText');
const controlsSection = document.getElementById('controlsSection');
const stopSection = document.getElementById('stopSection');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const errorContainer = document.getElementById('errorContainer');
const errorText = document.getElementById('errorText');

// Navigation Tabs
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Parameter Controllers
const fpsSelect = document.getElementById('fpsSelect');

let isRecording = false;
let selectedMode = 'tab';

// Modern Tab Engine 
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.getAttribute('data-tab');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Mode Selector Core
recordTabBtn.addEventListener('click', () => selectMode('tab', recordTabBtn));
recordScreenBtn.addEventListener('click', () => selectMode('screen', recordScreenBtn));

function selectMode(mode, button) {
  if (isRecording) return;
  selectedMode = mode;
  document.querySelectorAll('.mode-card').forEach(card => card.classList.remove('active'));
  button.classList.add('active');
}

// Execution Controls
startBtn.addEventListener('click', () => startRecording(selectedMode));
stopBtn.addEventListener('click', stopRecording);

async function startRecording(recordingType) {
  try {
    isRecording = true;
    updateUI('recording');
    statusText.textContent = 'Initializing engine...';

    const fps = fpsSelect ? parseInt(fpsSelect.value) : 60;

    const response = await chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      recordingType: recordingType,
      fps: fps,
    });

    if (!response || !response.success) {
      throw new Error((response && response.error) || 'Pipeline allocation failed');
    }

    if (response.countdown) {
      await showCountdown(recordingType);
    } else {
      statusText.textContent = recordingType === 'tab' ? 'Live: Transcoding Tab' : 'Live: Desktop Feed';
    }
  } catch (error) {
    showError(error.message);
    isRecording = false;
    updateUI('idle');
  }
}

async function showCountdown(recordingType) {
  return new Promise((resolve) => {
    let count = 3;
    statusText.textContent = `Starting stream in ${count}s...`;

    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        statusText.textContent = `Starting stream in ${count}s...`;
      } else {
        clearInterval(countdownInterval);
        statusText.textContent = recordingType === 'tab' ? 'Live: Transcoding Tab' : 'Live: Desktop Feed';
        resolve();
      }
    }, 1000);
  });
}

async function stopRecording() {
  try {
    isRecording = false;
    updateUI('uploading');
    statusText.textContent = 'Packaging bytes...';

    const response = await chrome.runtime.sendMessage({
      type: 'STOP_RECORDING',
    });

    if (!response || !response.success) {
      throw new Error((response && response.error) || 'Failed to complete write operation');
    }

    simulateProgress();

    setTimeout(() => {
      updateUI('idle');
      statusText.textContent = 'Redirecting to Better Flow workspace...';
      setTimeout(() => {
        window.close();
      }, 1200);
    }, 2200);
  } catch (error) {
    showError(error.message);
    isRecording = false;
    updateUI('idle');
  }
}

function updateUI(state) {
  if (state === 'recording') {
    controlsSection.classList.add('hidden');
    stopSection.classList.remove('hidden');
    progressSection.classList.add('hidden');
    statusEl.className = 'status recording';
  } else if (state === 'uploading') {
    controlsSection.classList.add('hidden');
    stopSection.classList.add('hidden');
    progressSection.classList.remove('hidden');
    statusEl.className = 'status uploading';
  } else {
    controlsSection.classList.remove('hidden');
    stopSection.classList.add('hidden');
    progressSection.classList.add('hidden');
    statusEl.className = 'status idle';
    statusText.textContent = 'Ready engine';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
  }
}

function simulateProgress() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 25;
    if (progress > 100) progress = 100;

    progressFill.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '%';

    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 150);
}

function showError(message) {
  errorText.textContent = message;
  errorContainer.classList.remove('hidden');
  setTimeout(() => {
    errorContainer.classList.add('hidden');
  }, 5000);
}