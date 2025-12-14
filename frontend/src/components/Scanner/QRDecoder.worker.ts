import QrScanner from 'qr-scanner';

self.onmessage = async (event: MessageEvent) => {
  const { imageData, width, height } = event.data;

  try {
    // Create ImageData from the received data
    const imgData = new ImageData(
      new Uint8ClampedArray(imageData),
      width,
      height
    );

    // Convert ImageData to OffscreenCanvas for qr-scanner
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    ctx.putImageData(imgData, 0, 0);

    // qr-scanner's scanImage accepts OffscreenCanvas
    const result = await QrScanner.scanImage(canvas);
    
    if (result) {
      self.postMessage({
        success: true,
        text: result,
      });
    } else {
      self.postMessage({
        success: false,
        error: 'No QR code found',
      });
    }
  } catch (error) {
    // Silently fail - QR code not found is expected
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // qr-scanner throws 'No QR code found' error when no code is detected
    if (errorMessage.includes('No QR code') || 
        errorMessage.includes('not found') ||
        errorMessage === 'No QR code found') {
      // Expected - no QR code in frame
      self.postMessage({
        success: false,
        error: 'No QR code found',
      });
    } else {
      // Unexpected error - log it for debugging
      console.error('QR decoder error:', errorMessage);
      self.postMessage({
        success: false,
        error: errorMessage,
      });
    }
  }
};

