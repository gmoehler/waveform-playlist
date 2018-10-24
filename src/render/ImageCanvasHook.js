
/*
* virtual-dom hook for drawing an image to the canvas element.
*/
class ImageCanvasHook {
  constructor(image, currentSourceCue, sourceWidth, currentStartPx, targetWidth) {
    this.image = image;
    this.currentSourceCue = currentSourceCue;
    this.sourceWidth = sourceWidth;
    this.currentStartPx = currentStartPx;
    this.targetWidth = targetWidth;
  }

  hook(canvas) {
    const cc = canvas.getContext('2d');

    const img = new Image();
    img.src = this.image;
    img.addEventListener('load', () => {
      cc.drawImage(img, this.currentSourceCue, 0, this.sourceWidth, img.height,
          this.currentStartPx, 0, this.targetWidth, canvas.height);
    });
  }
}

export default ImageCanvasHook;
