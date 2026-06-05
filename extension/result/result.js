// Modified by konlyzx (2026) - Restructured runtime events and integrated metadata tracking seamlessly
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

const recordedVideo = document.getElementById('recordedVideo');
const videoWrapper = document.getElementById('videoWrapper');
const videoSize = document.getElementById('videoSize');
const videoDuration = document.getElementById('videoDuration');
const videoDimensions = document.getElementById('videoDimensions');

const sendToEditorBtn = document.getElementById('sendToEditorBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const copyShareBtn = document.getElementById('copyShareBtn');
const shareUrlInput = document.getElementById('shareUrl');

const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

let videoBlob = null;
let tabId = null;

console.log('Premium result.js operational pipeline running');

// Setup and activate Lucide Icons tracking
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Global Core Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Result interceptor captured message:', request.type);
  
  if (request.type === 'SET_VIDEO_DATA') {
    try {
      processIncomingBase64(request.videoBlob, request.originalTabId);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Data pipeline failure:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
});

// Fallback checking sequence
chrome.runtime.sendMessage({ type: 'GET_RECORDED_VIDEO' }, (response) => {
  if (response && response.videoBlob && !videoBlob) {
    processIncomingBase64(response.videoBlob, response.tabId);
  }
});

// Structural translation engine (Base64 -> Blobs)
function processIncomingBase64(base64Data, originalTabId) {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  videoBlob = new Blob([bytes], { type: 'video/webm' });
  tabId = originalTabId;

  const videoUrl = URL.createObjectURL(videoBlob);
  recordedVideo.src = videoUrl;
  
  // Show UI Components smoothly
  loadingOverlay.style.display = 'none';
  videoWrapper.style.display = 'block';

  // Compute sizing metadata metrics
  const sizeMB = (videoBlob.size / (1024 * 1024)).toFixed(2);
  videoSize.textContent = `Size: ${sizeMB} MB`;
  
  // Feed placeholders until integration
  shareUrlInput.value = `https://cdn.betterflow.site/stream/feed-${Date.now().toString().slice(-6)}.webm`;
}

// Safety timeout protocol
setTimeout(() => {
  if (!videoBlob) {
    loadingOverlay.style.display = 'flex';
    loadingText.textContent = 'Pipeline Timeout: No streaming data stream received.';
    loadingText.style.color = '#ef4444';
  }
}, 3000);

// Video Data Metadata Tracker
recordedVideo.addEventListener('loadedmetadata', () => {
  const duration = recordedVideo.duration;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  videoDuration.textContent = `Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`;

  const width = recordedVideo.videoWidth;
  const height = recordedVideo.videoHeight;
  videoDimensions.textContent = `Resolution: ${width}x${height}`;
});

/* ==========================================================================
   Action Interactive Infrastructure (Listeners)
   ========================================================================== */

// 1. OPEN IN BETTER FLOW (REPAIRED & UNIFIED CORE)
sendToEditorBtn.addEventListener('click', async () => {
  if (!videoBlob) return;

  setUIProcessingState('Uploading to Cloud Environment...');

  try {
    const reader = new FileReader();
    const base64Video = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(videoBlob);
    });

    chrome.runtime.sendMessage({
      type: 'UPLOAD_VIDEO',
      videoBlob: base64Video,
    }, (response) => {
      if (chrome.runtime.lastError) {
        restoreUIProcessingState('Error: ' + chrome.runtime.lastError.message);
        return;
      }

      if (response && response.success) {
        loadingText.textContent = 'Deployed successfully! Synced to Core.';
        setTimeout(() => {
          if (tabId) chrome.tabs.reload(tabId);
          window.close();
        }, 1000);
      } else {
        restoreUIProcessingState('Error: ' + (response?.error || 'Upload aborted'));
      }
    });
  } catch (error) {
    restoreUIProcessingState('Error: ' + error.message);
  }
});

// 2. Local Download Action
downloadBtn.addEventListener('click', () => {
  if (!videoBlob) return;
  const url = URL.createObjectURL(videoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `betterflow-stream-${Date.now()}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// 3. Clipboard Raw Copy Action
copyBtn.addEventListener('click', () => {
  if (!videoBlob) return;
  navigator.clipboard.write([
    new ClipboardItem({ [videoBlob.type]: videoBlob })
  ]).then(() => {
    const origText = copyBtn.querySelector('span').textContent;
    copyBtn.querySelector('span').textContent = 'Copied!';
    setTimeout(() => copyBtn.querySelector('span').textContent = origText, 1500);
  });
});

// 4. Input CDN Link Copy Action
copyShareBtn.addEventListener('click', () => {
  if (shareUrlInput.value) {
    navigator.clipboard.writeText(shareUrlInput.value).then(() => {
      copyShareBtn.style.color = '#2b6fff';
      setTimeout(() => copyShareBtn.style.color = '#a1a1aa', 1500);
    });
  }
});

// UI Pipeline Helpers
function setUIProcessingState(text) {
  loadingOverlay.style.display = 'flex';
  loadingText.textContent = text;
  loadingText.style.color = '#ffffff';
  sendToEditorBtn.disabled = true;
  downloadBtn.disabled = true;
}

function restoreUIProcessingState(errorMsg) {
  loadingText.textContent = errorMsg;
  loadingText.style.color = '#ef4444';
  sendToEditorBtn.disabled = false;
  downloadBtn.disabled = false;
}

// Boot setup
refreshIcons();