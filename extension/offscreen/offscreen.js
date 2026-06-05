// Modified by konlyzx (2026) - Fixed offscreen UI restrictions: moved tab opening to background, offscreen now only packages data
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

console.log('OFFSCREEN DOCUMENT LOADED -', new Date().toISOString());

let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let tabId = null;
let isAutoScrolling = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('=== Message received in offscreen ===');
  console.log('Request type:', request.type);
  console.log('Request action:', request.action);
  console.log('Full request:', request);
  
  if (request.type === 'PING') {
    console.log('Responding to PING');
    sendResponse({ alive: true, timestamp: Date.now() });
    return true;
  }
  
  if (request.type === 'REQUEST_STREAM') {
    console.log('Handling REQUEST_STREAM with FPS:', request.fps);
    // This is the entry point - request stream from user
    requestStream(request.recordingType, request.tabId, sendResponse, request.fps);
    return true;
  }

  // STEP 3: Listen for STOP_RECORDING from background
  if (request.action === 'STOP_RECORDING') {
    console.log('✓ STEP 3: Received STOP_RECORDING from background - calling stopRecording()');
    stopRecording(sendResponse);
    return true;
  }

  if (request.type === 'STOP_RECORDING_OFFSCREEN') {
    console.log('✓ Received STOP_RECORDING_OFFSCREEN - calling stopRecording()');
    stopRecording(sendResponse);
    return true;
  }
  
  console.log('Unknown message type, ignoring');
});

// Step 1: Request stream from user (BLOCKING - waits for user permission)
async function requestStream(recordingType, passedTabId, sendResponse, fps = 60) {
  console.log('requestStream called, type:', recordingType, 'tabId:', passedTabId, 'FPS:', fps);
  try {
    recordedChunks = [];
    tabId = passedTabId;

    let mediaConstraints = {};

    // High quality screen/tab recording for GIF (60fps, full HD)
    console.log('Requesting high quality stream for GIF recording...');
    mediaConstraints = {
      video: {
        cursor: 'always',
        displaySurface: recordingType === 'screen' ? 'monitor' : 'browser',
      },
      audio: false, // GIF doesn't need audio
    };
    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
        displaySurface: recordingType === 'screen' ? 'monitor' : 'browser',
      },
      audio: false,
    });
    
    console.log('✓ User granted permission. Stream obtained, tracks:', mediaStream.getTracks().length);
    mediaStream.getTracks().forEach(track => {
      console.log('  Track:', track.kind, 'enabled:', track.enabled, 'readyState:', track.readyState);
    });

    // Check if stream is active
    if (mediaStream.getVideoTracks().length === 0) {
      throw new Error('No video tracks in stream');
    }

    // STEP 4: Initialize MediaRecorder with high FPS for quality GIF
    await startMediaRecorder(fps);

    // STEP 5: Notify background that recording is ACTUALLY active
    console.log('✓ MediaRecorder started. Notifying background...');
    chrome.runtime.sendMessage({
      type: 'RECORDING_IS_ACTIVE',
      tabId: tabId,
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error notifying background:', chrome.runtime.lastError);
      } else {
        console.log('Background acknowledged recording is active');
      }
    });

    // Respond to the initial REQUEST_STREAM message
    sendResponse({
      success: true,
      message: 'Recording started successfully',
    });
  } catch (error) {
    console.error('Error in requestStream:', error);
    stopMediaStream();
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}

// Step 4: Initialize and start MediaRecorder with high quality settings
async function startMediaRecorder(targetFps = 60) {
  console.log('Initializing MediaRecorder with target FPS:', targetFps);
  
  // Apply FPS constraint to video track
  const videoTrack = mediaStream.getVideoTracks()[0];
  if (videoTrack) {
    try {
      await videoTrack.applyConstraints({
        frameRate: targetFps
      });
      console.log('Applied FPS constraint:', targetFps);
    } catch (e) {
      console.log('Could not apply FPS constraint, using default:', e.message);
    }
  }
  
  const options = {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 8000000, // 8 Mbps for high quality
  };

  // Fallback mime types
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options.mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options.mimeType = 'video/webm';
  }

  mediaRecorder = new MediaRecorder(mediaStream, options);
  console.log('MediaRecorder created with mimeType:', options.mimeType);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
      console.log('Data chunk received:', event.data.size, 'bytes');
    }
  };

  mediaRecorder.onerror = (event) => {
    console.error('MediaRecorder error:', event.error);
  };

  // Add listener for when user stops sharing via the browser UI
  const videoTrackForEnd = mediaStream.getVideoTracks()[0];
  videoTrackForEnd.onended = () => {
    console.log('Video track ended (user stopped sharing)');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  // Start recording with timeslice for continuous data
  mediaRecorder.start(1000);
  console.log('✓ MediaRecorder.start() called');
}

async function stopRecording(sendResponse) {
  try {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      console.error('No active recording to stop');
      sendResponse({
        success: false,
        error: 'No active recording',
      });
      return;
    }

    console.log('STEP 3: Stopping MediaRecorder...');
    
    // Request final data chunk before stopping
    mediaRecorder.requestData();
    
    // Wait a moment for data to be available
    await new Promise(resolve => setTimeout(resolve, 500));

    // STEP 3: Stop the MediaRecorder
    mediaRecorder.stop();

    // STEP 3: Stop all media stream tracks (removes Chrome "Stop sharing" bar)
    console.log('STEP 3: Stopping media stream tracks...');
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        console.log('  - Stopping track:', track.kind);
        track.stop();
      });
    }

    // STEP 4: Wait for onstop event and process blob (with timeout fallback)
    await new Promise((resolve, reject) => {
      let onstopFired = false;
      
      const timeoutId = setTimeout(() => {
        if (!onstopFired) {
          console.warn('STEP 4: onstop event timeout, processing chunks anyway...');
          onstopFired = true;
          processRecordedVideo(resolve, reject);
        }
      }, 2000);

      mediaRecorder.onstop = async () => {
        if (!onstopFired) {
          onstopFired = true;
          clearTimeout(timeoutId);
          console.log('STEP 4: MediaRecorder onstop event - chunks:', recordedChunks.length);
          processRecordedVideo(resolve, reject);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error during stop:', event.error);
        clearTimeout(timeoutId);
        reject(new Error(event.error));
      };
    });

    // Helper function to process recorded video
    async function processRecordedVideo(resolve, reject) {
      try {
        console.log('STEP 4: Processing recorded video - chunks:', recordedChunks.length);
        
        if (recordedChunks.length === 0) {
          console.warn('STEP 4: No chunks recorded!');
        }
        
        // Create blob from recorded chunks
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log('STEP 4: Video blob created, size:', videoBlob.size, 'bytes');

        // STEP 4: Send video data to background (offscreen cannot open tabs in Manifest V3)
        console.log('STEP 4: Sending video data to background for UI handling...');
        await sendVideoToBackground(videoBlob, tabId);
        
        resolve();
      } catch (error) {
        console.error('Error processing video:', error);
        reject(error);
      }
    }

    sendResponse({
      success: true,
      message: 'Recording stopped and uploaded',
    });
  } catch (error) {
    console.error('Error stopping recording:', error);
    stopMediaStream();
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}

// STEP 4: Upload video blob to R2
async function uploadToR2(videoBlob, passedTabId) {
  try {
    console.log('STEP 4: Starting R2 upload...');
    
    const fileName = `recording-${Date.now()}.webm`;
    
    // Get presigned upload URL from backend
    console.log('STEP 4: Requesting presigned URL from API...');
    const uploadUrlResponse = await fetch('https://betterflow.site/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: fileName,
        contentType: 'video/webm',
      }),
    });

    if (!uploadUrlResponse.ok) {
      throw new Error('Failed to get upload URL: ' + uploadUrlResponse.statusText);
    }

    const { uploadUrl, fileUrl } = await uploadUrlResponse.json();
    console.log('STEP 4: Got presigned URL, uploading blob...');

    // Upload blob to R2 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/webm' },
      body: videoBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to R2: ' + uploadResponse.statusText);
    }

    console.log('✓ STEP 4: Video uploaded to R2 successfully');
    console.log('File URL:', fileUrl);

    // STEP 4: Open editor with video URL
    console.log('STEP 4: Opening editor with video...');
    const editorUrl = `http://localhost:3000/?videoUrl=${encodeURIComponent(fileUrl)}`;
    chrome.tabs.create({ url: editorUrl });

    // Clean up
    stopMediaStream();
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
}

// STEP 4: Send video data to background (Manifest V3: offscreen cannot open tabs)
async function sendVideoToBackground(videoBlob, passedTabId) {
  try {
    console.log('STEP 4: Converting video blob to base64 for background...');
    
    // Convert blob to base64 for transmission
    const reader = new FileReader();
    const base64Data = await new Promise((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(videoBlob);
    });

    console.log('STEP 4: Video converted to base64, size:', base64Data.length);
    console.log('STEP 4: Sending VIDEO_READY message to background...');
    
    // Send video data to background - background will handle UI and tab opening
    chrome.runtime.sendMessage({
      action: 'VIDEO_READY',
      videoBlob: base64Data,
      originalTabId: passedTabId,
      videoSize: videoBlob.size
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending video to background:', chrome.runtime.lastError);
      } else {
        console.log('✓ Video data sent to background successfully:', response);
      }
    });

    // Clean up
    stopMediaStream();
  } catch (error) {
    console.error('Error sending video to background:', error);
    throw error;
  }
}

function stopMediaStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
    mediaStream = null;
  }
  mediaRecorder = null;
  recordedChunks = [];
}

// This function will be injected into the tab to handle auto-scrolling
function startAutoScroll() {
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
      console.log('Reached end of page');
      isScrolling = false;
      // Notify background that scroll is complete
      chrome.runtime.sendMessage({ type: 'SCROLL_COMPLETE' });
    }
  }
  
  // Start scrolling
  scroll();
  
  // Store reference to stop scrolling if needed
  window.__stopAutoScroll = () => {
    isScrolling = false;
  };
}
