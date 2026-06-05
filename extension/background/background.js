// Modified by konlyzx (2026) - Fixed Manifest V3 compliance: moved tab opening from offscreen to background, offscreen only packages data
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

const OFFSCREEN_DOCUMENT_PATH = '/offscreen/offscreen.html';
const API_BASE = 'http://localhost:3000';

// Function to inject into tab for auto-scrolling
function injectAutoScroll() {
  console.log('Auto-scroll started in tab');
  
  const scrollSpeed = 2; // pixels per frame
  let isScrolling = true;
  
  function scroll() {
    if (!isScrolling) return;
    
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY;
    
    if (currentScroll < maxScroll) {
      window.scrollBy(0, scrollSpeed);
      requestAnimationFrame(scroll);
    } else {
      console.log('✓ Reached end of page - sending SCROLL_FINISHED');
      isScrolling = false;
      // STEP 1: Send SCROLL_FINISHED to background
      chrome.runtime.sendMessage({ action: 'SCROLL_FINISHED' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending SCROLL_FINISHED:', chrome.runtime.lastError);
        } else {
          console.log('Background acknowledged SCROLL_FINISHED');
        }
      });
    }
  }
  
  // Start scrolling
  scroll();
  
  // Store reference to stop scrolling if needed
  window.__stopAutoScroll = () => {
    isScrolling = false;
    chrome.runtime.sendMessage({ action: 'SCROLL_FINISHED' });
  };
}

// Ensure offscreen document exists
async function ensureOffscreenDocument() {
  console.log('Ensuring offscreen document...');
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  console.log('Offscreen URL:', offscreenUrl);
  
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });

  console.log('Existing offscreen contexts:', existingContexts.length);

  if (existingContexts.length > 0) {
    console.log('Offscreen document already exists');
    return;
  }

  console.log('Creating offscreen document...');
  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['DISPLAY_MEDIA'],
      justification: 'Screen recording requires an offscreen document to handle getDisplayMedia API for capturing tab or screen content.',
    });
    console.log('Offscreen document created successfully');
    // Wait for document to fully initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Waited 1s for offscreen initialization');
  } catch (error) {
    console.error('Error creating offscreen document:', error);
    throw error;
  }
}

// Store recording state
let recordingState = {
  isRecording: false,
  tabId: null,
  recordingType: null,
  videoBlob: null,
};

// Handle messages from popup and offscreen document
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_RECORDING') {
    handleStartRecording(request, sendResponse);
    return true;
  }

  if (request.type === 'STOP_RECORDING') {
    handleStopRecording(request, sendResponse);
    return true;
  }

  if (request.type === 'UPLOAD_VIDEO') {
    handleUploadVideo(request, sendResponse);
    return true;
  }

  if (request.type === 'SCROLL_COMPLETE') {
    console.log('Scroll complete, auto-stopping recording...');
    // Auto-stop recording when scroll finishes
    chrome.runtime.sendMessage({
      type: 'STOP_RECORDING_OFFSCREEN',
    });
    return true;
  }

  if (request.type === 'GET_RECORDED_VIDEO') {
    sendResponse({
      videoBlob: recordingState.videoBlob,
      tabId: recordingState.tabId,
    });
    return true;
  }

  // STEP 2: Listen for SCROLL_FINISHED from content script
  if (request.action === 'SCROLL_FINISHED') {
    console.log('STEP 2: Received SCROLL_FINISHED from content script');
    sendResponse({ success: true });
    
    // STEP 2: Send STOP_RECORDING to offscreen
    console.log('STEP 2: Sending STOP_RECORDING to offscreen...');
    chrome.runtime.sendMessage({
      action: 'STOP_RECORDING',
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending STOP_RECORDING:', chrome.runtime.lastError);
      } else {
        console.log('Offscreen acknowledged STOP_RECORDING');
      }
    });
    return true;
  }

  // STEP 3: Listen for VIDEO_READY from offscreen (Manifest V3: background opens tabs, not offscreen)
  if (request.action === 'VIDEO_READY') {
    console.log('✓ STEP 3: Background received VIDEO_READY from offscreen');
    console.log('Video size:', request.videoSize, 'bytes');
    
    // Store video data for result modal
    recordingState.videoBlob = request.videoBlob;
    recordingState.tabId = request.originalTabId;
    recordingState.videoSize = request.videoSize;
    
    // Open result modal (background has permission to open tabs, offscreen doesn't)
    console.log('STEP 3: Opening result modal from background...');
    openResultModal(request.videoBlob, request.originalTabId);
    
    sendResponse({ success: true, message: 'Video received, opening modal' });
    return true;
  }
});

async function handleStartRecording(request, sendResponse) {
  console.log('=== STEP 1: handleStartRecording called ===');
  try {
    // STEP 2: Ensure offscreen document exists
    console.log('STEP 2: Ensuring offscreen document...');
    await ensureOffscreenDocument();

    const recordingType = request.recordingType;
    const fps = request.fps || 60;
    console.log('Recording type:', recordingType, 'FPS:', fps);

    let tabId = null;

    // Get current tab if recording tab
    if (recordingType === 'tab') {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        tabId = tabs[0].id;
        recordingState.tabId = tabId;
        recordingState.recordingType = recordingType;
        console.log('Current tab ID:', tabId);
      }
    } else if (recordingType === 'cam') {
      // For camera-only recording, no tab ID needed
      recordingState.recordingType = recordingType;
      console.log('Camera-only recording mode');
    } else if (recordingType === 'screen') {
      // For screen recording, no tab ID needed
      recordingState.recordingType = recordingType;
      console.log('Screen recording mode');
    }

    // Show countdown in popup
    sendResponse({
      success: true,
      message: 'Starting countdown...',
      countdown: true,
    });

    // Wait 3 seconds for countdown
    console.log('Waiting 3 seconds for countdown...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // STEP 2: Send REQUEST_STREAM to offscreen
    // This will BLOCK until user grants permission
    console.log('STEP 2: Sending REQUEST_STREAM to offscreen...');
    chrome.runtime.sendMessage(
      {
        type: 'REQUEST_STREAM',
        recordingType: recordingType,
        tabId: tabId,
        fps: fps,
      },
      (response) => {
        console.log('Offscreen responded to REQUEST_STREAM:', response);
        if (chrome.runtime.lastError) {
          console.error('Error from offscreen:', chrome.runtime.lastError);
        }
      }
    );

    // STEP 5: Listen for RECORDING_IS_ACTIVE message from offscreen
    // This is where we inject scripts ONLY AFTER recording is actually active
    const recordingActiveListener = (request, sender, sendResponse) => {
      if (request.type === 'RECORDING_IS_ACTIVE') {
        console.log('STEP 5: Received RECORDING_IS_ACTIVE from offscreen!');
        chrome.runtime.onMessage.removeListener(recordingActiveListener);

        // NOW inject scripts (cursor hiding + auto-scroll)
        injectRecordingScripts(request.tabId);
      }
    };

    chrome.runtime.onMessage.addListener(recordingActiveListener);
  } catch (error) {
    console.error('Error in handleStartRecording:', error);
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}

// Inject cursor hiding and auto-scroll scripts
async function injectRecordingScripts(tabId) {
  try {
    console.log('STEP 5: Injecting recording scripts into tab', tabId);

    // Inject CSS to hide cursor
    console.log('  - Hiding cursor...');
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      css: '* { cursor: none !important; }',
    });
    console.log('  ✓ Cursor hidden');

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Inject auto-scroll script
    console.log('  - Starting auto-scroll...');
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: injectAutoScroll,
    });
    console.log('  ✓ Auto-scroll injected');
  } catch (error) {
    console.error('Error injecting scripts:', error);
  }
}

async function handleStopRecording(request, sendResponse) {
  try {
    // Send message to offscreen document to stop recording
    chrome.runtime.sendMessage(
      {
        type: 'STOP_RECORDING_OFFSCREEN',
      },
      (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          // Save video blob from response
          if (response && response.videoBlob) {
            recordingState.videoBlob = response.videoBlob;
            console.log('Video saved, opening result modal...');
            
            // Open result modal
            const resultUrl = chrome.runtime.getURL('/result/result.html');
            chrome.windows.create({
              url: resultUrl,
              type: 'popup',
              width: 650,
              height: 800,
            });
          }
          sendResponse(response);
        }
      }
    );
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}

// STEP 3: Open result modal and send video data (Manifest V3: only background can open tabs)
function openResultModal(videoBlob, originalTabId) {
  console.log('STEP 3: Opening result modal from background...');
  
  // Open result modal in a new tab
  chrome.tabs.create({
    url: chrome.runtime.getURL('result/result.html'),
    active: true
  }, (tab) => {
    if (chrome.runtime.lastError) {
      console.error('Error opening result modal:', chrome.runtime.lastError);
      return;
    }
    
    console.log('Result modal opened, tab ID:', tab.id);
    
    // Wait for the tab to fully load, then send the video data
    let attempts = 0;
    const maxAttempts = 10;
    
    const sendVideoData = () => {
      attempts++;
      console.log(`Attempting to send video data to modal (attempt ${attempts}/${maxAttempts})...`);
      
      chrome.tabs.sendMessage(tab.id, {
        type: 'SET_VIDEO_DATA',
        videoBlob: videoBlob,
        originalTabId: originalTabId
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending video data to modal:', chrome.runtime.lastError);
          
          // Retry if tab is not ready yet
          if (attempts < maxAttempts) {
            setTimeout(sendVideoData, 500);
          }
        } else {
          console.log('✓ Video data sent to modal successfully:', response);
        }
      });
    };
    
    // Start sending after tab loads
    setTimeout(sendVideoData, 1000);
  });
}

async function handleUploadVideo(request, sendResponse) {
  try {
    console.log('UPLOAD_VIDEO: Starting upload process');
    const base64Video = request.videoBlob;
    const fileName = `recording-${Date.now()}.webm`;
    console.log('UPLOAD_VIDEO: File name:', fileName, 'base64 size:', base64Video.length);

    // Upload video to backend, which handles R2 upload (avoids CORS issues)
    console.log('UPLOAD_VIDEO: Uploading via API...');
    const uploadResponse = await fetch(`${API_BASE}/api/upload-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoBase64: base64Video,
        fileName: fileName,
      }),
    });

    console.log('UPLOAD_VIDEO: API response status:', uploadResponse.status);
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('UPLOAD_VIDEO: Upload failed:', errorText);
      throw new Error('Upload failed: ' + errorText);
    }

    const { fileUrl } = await uploadResponse.json();
    console.log('UPLOAD_VIDEO: Success, file URL:', fileUrl);

    // Open editor with video URL
    const editorUrl = `${API_BASE}/?videoUrl=${encodeURIComponent(fileUrl)}`;
    chrome.tabs.create({ url: editorUrl });

    sendResponse({
      success: true,
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error('handleUploadVideo error:', error);
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}
