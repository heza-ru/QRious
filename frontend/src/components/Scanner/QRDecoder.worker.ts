import { BrowserQRCodeReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

let codeReader: BrowserQRCodeReader | null = null;

self.onmessage = async (event: MessageEvent) => {
  const { imageData, width, height } = event.data;

  try {
    if (!codeReader) {
      const hints = new Map<DecodeHintType, any>();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      codeReader = new BrowserQRCodeReader(hints as any);
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
    
    // Use decodeFromImageElement - it accepts ImageBitmap in newer versions
    // Cast to any to work around TypeScript type issues with ImageBitmap
    const result = await (codeReader as any).decodeFromImageElement(imageBitmap as any);
    
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

