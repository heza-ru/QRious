import { BrowserQRCodeReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

let codeReader: BrowserQRCodeReader | null = null;

self.onmessage = async (event: MessageEvent) => {
  const { imageData, width, height } = event.data;

  try {
    if (!codeReader) {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      codeReader = new BrowserQRCodeReader(hints);
    }

    // Create ImageData from the received data
    const imgData = new ImageData(
      new Uint8ClampedArray(imageData),
      width,
      height
    );

    // Create a canvas to render the image
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    ctx.putImageData(imgData, 0, 0);

    // Convert canvas to ImageBitmap for decoding
    const imageBitmap = await createImageBitmap(canvas);

    // Decode QR code
    const result = await codeReader.decodeFromImageBitmap(imageBitmap);
    
    if (result) {
      self.postMessage({
        success: true,
        text: result.getText(),
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
    if (errorMessage.includes('No QR code') || errorMessage.includes('NotFoundException')) {
      // Expected - no QR code in frame
      self.postMessage({
        success: false,
        error: 'No QR code found',
      });
    } else {
      // Unexpected error
      console.error('QR decoder error:', errorMessage);
      self.postMessage({
        success: false,
        error: errorMessage,
      });
    }
  }
};

