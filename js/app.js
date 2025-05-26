// Constants for the app - You'll need to replace this URL with your mask detection model
const URL = 'https://teachablemachine.withgoogle.com/models/ITkJZxu0G/';
const modelURL = URL + 'model.json';
const metadataURL = URL + 'metadata.json';

// Status message element
const statusMessageElement = document.getElementById('webcam-status');

let model, webcam, canvas, ctx, labelContainer, maxPredictions;
let lastMaskStatus = null; // Track last mask status to avoid unnecessary UI updates
let goodJobAnimationActive = false; // Track if the "Good Job" animation is currently playing

// DOM elements
const enableCamButton = document.getElementById('enableCam');
const webCamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const currentStatusElement = document.getElementById('current-gesture'); // Repurpose for mask status
const maskProgressBar = document.getElementById('rock-progress'); // Repurpose for mask
const noMaskProgressBar = document.getElementById('paper-progress'); // Repurpose for no mask
const maskProbability = document.getElementById('rock-probability'); // Repurpose for mask
const noMaskProbability = document.getElementById('paper-probability'); // Repurpose for no mask

// New elements for mask detection UI
const warningElement = document.createElement('div');
warningElement.id = 'mask-warning';
warningElement.innerHTML = 'THIS USER IS NOT WEARING MASK<br>PLEASE BE AWARE';
warningElement.style.display = 'none';
warningElement.style.position = 'absolute';
warningElement.style.bottom = '10px';
warningElement.style.right = '10px';
warningElement.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
warningElement.style.color = 'white';
warningElement.style.padding = '10px';
warningElement.style.borderRadius = '5px';
warningElement.style.fontWeight = 'bold';
document.body.appendChild(warningElement);

// Thumbnail for unmasked users
const unmaskThumbnail = document.createElement('div');
unmaskThumbnail.id = 'unmask-thumbnail';
unmaskThumbnail.style.display = 'none';
unmaskThumbnail.style.position = 'absolute';
unmaskThumbnail.style.bottom = '90px';
unmaskThumbnail.style.right = '10px';
unmaskThumbnail.style.width = '100px';
unmaskThumbnail.style.height = '100px';
unmaskThumbnail.style.border = '2px solid red';
unmaskThumbnail.style.overflow = 'hidden';
document.body.appendChild(unmaskThumbnail);

const thumbnailCanvas = document.createElement('canvas');
thumbnailCanvas.width = 100;
thumbnailCanvas.height = 100;
unmaskThumbnail.appendChild(thumbnailCanvas);
const thumbnailCtx = thumbnailCanvas.getContext('2d');

// Good job animation container
const goodJobContainer = document.createElement('div');
goodJobContainer.id = 'good-job-container';
goodJobContainer.style.display = 'none';
goodJobContainer.style.position = 'absolute';
goodJobContainer.style.top = '50%';
goodJobContainer.style.left = '50%';
goodJobContainer.style.transform = 'translate(-50%, -50%)';
goodJobContainer.style.fontSize = '36px';
goodJobContainer.style.color = 'green';
goodJobContainer.style.fontWeight = 'bold';
document.body.appendChild(goodJobContainer);

// Set up the canvas
if (canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
}

// Initialize the event listener for the webcam button
if (enableCamButton) {
  enableCamButton.addEventListener('click', initWebcam);
}

// Function to initialize the webcam
async function initWebcam() {
  try {
    // Clear previous error messages
    if (statusMessageElement) {
      statusMessageElement.textContent = '';
    }
    
    // Disable the button during initialization
    enableCamButton.disabled = true;
    enableCamButton.innerText = 'Loading...';
    
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    }
    
    // Request camera access explicitly before initializing the webcam
    await navigator.mediaDevices.getUserMedia({ 
      video: true,
      audio: false
    });
    
    // Display loading model message
    updateStatus('Loading model from Teachable Machine...', 'info');
    
    try {
      // Load the model from the provided URL
      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();
      updateStatus('Model loaded successfully!', 'info');
    } catch (modelError) {
      console.error('Model loading error:', modelError);
      throw new Error(`Failed to load model from ${URL}. ${modelError.message}`);
    }
    
    // Set up webcam with explicit constraints
    updateStatus('Setting up webcam...', 'info');
    const flip = true; // flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip);
    
    try {
      await webcam.setup({ facingMode: 'user' }); // Use front camera
      await webcam.play();
      
      // Resize canvas to webcam dimensions
      canvas.width = webcam.width;
      canvas.height = webcam.height;
      
      // Update button state
      enableCamButton.innerText = 'Webcam Enabled';
      enableCamButton.classList.add('enabled');
      
      // Clear status message on success
      updateStatus('Ready!', 'info');
      setTimeout(() => updateStatus('', ''), 2000);
      
      // Start the prediction loop
      window.requestAnimationFrame(loop);
    } catch (webcamError) {
      throw new Error(`Webcam setup failed: ${webcamError.message}`);
    }
    
  } catch (error) {
    console.error('Error initializing webcam:', error);
    
    // More informative error based on the type
    let errorMessage = '';
    if (error.message && error.message.includes('Failed to load model')) {
      errorMessage = 'Model loading error: ' + error.message;
      
      // Don't try to verify local model files since we're using a remote URL
      updateStatus('Error loading model from Teachable Machine', 'error');
    } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Camera permission denied. Please allow camera access and try again.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'No camera found. Please connect a webcam and try again.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Camera constraints cannot be satisfied. Please try with a different camera.';
    } else {
      errorMessage = 'Error accessing webcam: ' + error.message;
    }
    
    // Re-enable the button for retry
    enableCamButton.disabled = false;
    enableCamButton.innerText = 'Try Again';
    
    // Show specific error message
    alert(errorMessage);
    
    // Update UI to show error state
    currentStatusElement.textContent = "Camera Error";
    currentStatusElement.style.color = '#f44336'; // Red color for error
    
    // Update status message
    updateStatus(errorMessage, 'error');
  }
}

// Helper function to update status message
function updateStatus(message, type) {
  if (!statusMessageElement) return;
  
  statusMessageElement.textContent = message;
  
  // Reset classes first
  statusMessageElement.classList.remove('info', 'warning', 'error');
  
  // Add appropriate styling based on message type
  if (type) {
    statusMessageElement.classList.add(type);
  }
}

// Function to check if model files exist - not needed for remote URL but kept for reference
function checkModelFiles() {
  const remoteURL = URL + 'model.json';
  
  fetch(remoteURL, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        updateStatus(`✓ Remote model accessible at: ${URL}`, 'info');
      } else {
        updateStatus(`✗ Cannot access remote model at: ${URL}`, 'error');
      }
    })
    .catch(() => {
      updateStatus(`✗ Network error accessing: ${URL}`, 'error');
    });
}

// Main prediction and drawing loop
async function loop() {
  if (webcam && webcam.canvas) {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
  }
}

// Function to make predictions from the webcam feed
async function predict() {
  try {
    // Draw the webcam image on our canvas
    ctx.drawImage(webcam.canvas, 0, 0);

    // Make prediction using the model directly on the webcam canvas
    const predictions = await model.predict(webcam.canvas);
    
    // Assuming the model has two classes: "mask" and "no mask"
    let maskProb = 0;
    let noMaskProb = 0;
    
    // Find appropriate class predictions
    for (let i = 0; i < predictions.length; i++) {
      const prediction = predictions[i];
      const probability = prediction.probability.toFixed(2);
      const percentage = Math.round(prediction.probability * 100);
      
      const className = prediction.className.toLowerCase();
      if (className.includes('mask') && !className.includes('no')) {
        // This is the "mask" class
        maskProb = prediction.probability;
        updatePredictionUI(maskProgressBar, maskProbability, percentage);
      } 
      else if (className.includes('no') && className.includes('mask')) {
        // This is the "no mask" class
        noMaskProb = prediction.probability;
        updatePredictionUI(noMaskProgressBar, noMaskProbability, percentage);
      }
      
      // Log to console for debugging
      console.log(prediction.className + ": " + probability);
    }
    
    // Determine current mask status (using threshold)
    const currentMaskStatus = maskProb > 0.7 ? 'mask' : noMaskProb > 0.7 ? 'no mask' : 'uncertain';
    
    // Only update UI if status has changed to avoid flickering
    if (lastMaskStatus !== currentMaskStatus) {
      lastMaskStatus = currentMaskStatus;
      
      // Update UI based on mask status
      if (currentMaskStatus === 'mask') {
        currentStatusElement.textContent = "Mask Detected";
        currentStatusElement.style.color = '#4CAF50'; // Green
        hideWarningAndThumbnail();
        showGoodJobAnimation();
      } 
      else if (currentMaskStatus === 'no mask') {
        currentStatusElement.textContent = "No Mask Detected";
        currentStatusElement.style.color = '#f44336'; // Red
        showWarningAndThumbnail();
        hideGoodJobAnimation();
      } 
      else {
        currentStatusElement.textContent = "Uncertain";
        currentStatusElement.style.color = '#ff9800'; // Orange
        hideWarningAndThumbnail();
        hideGoodJobAnimation();
      }
    }
  } catch (error) {
    console.error('Prediction error:', error);
  }
}

// Helper function to update UI elements for a prediction
function updatePredictionUI(progressBar, probabilityElement, percentage) {
  if (progressBar && probabilityElement) {
    progressBar.style.width = percentage + '%';
    probabilityElement.textContent = percentage + '%';
  }
}

// Function to show warning and thumbnail for unmasked users
function showWarningAndThumbnail() {
  // Update thumbnail with current webcam frame
  thumbnailCtx.drawImage(webcam.canvas, 0, 0, 100, 100);
  
  // Show warning and thumbnail
  warningElement.style.display = 'block';
  unmaskThumbnail.style.display = 'block';
}

// Function to hide warning and thumbnail
function hideWarningAndThumbnail() {
  warningElement.style.display = 'none';
  unmaskThumbnail.style.display = 'none';
}

// Function to show "Good Job" animation
function showGoodJobAnimation() {
  if (goodJobAnimationActive) return;
  
  goodJobAnimationActive = true;
  goodJobContainer.textContent = "GOOD JOB! 😷";
  goodJobContainer.style.display = 'block';
  
  // Add some animation effects
  animateGoodJob();
  
  // Hide after 3 seconds
  setTimeout(() => {
    hideGoodJobAnimation();
  }, 3000);
}

// Function to animate the "Good Job" message
function animateGoodJob() {
  let scale = 1.0;
  let growing = true;
  
  const animate = () => {
    if (!goodJobAnimationActive) return;
    
    if (growing) {
      scale += 0.01;
      if (scale >= 1.3) growing = false;
    } else {
      scale -= 0.01;
      if (scale <= 1.0) growing = true;
    }
    
    goodJobContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;
    
    if (goodJobAnimationActive) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}

// Function to hide "Good Job" animation
function hideGoodJobAnimation() {
  goodJobAnimationActive = false;
  goodJobContainer.style.display = 'none';
}
