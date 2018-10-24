
/*
* virtual-dom hook for drawing an image to the canvas element.
*/
class ImageCanvasHook {
  constructor(image, currentSourceCue, sourceWidth, targetWidth) {
    this.image = image;
    this.currentSourceCue = currentSourceCue;
    this.sourceWidth = sourceWidth;
    this.targetWidth = targetWidth;
  }

  hook(canvas) {
    const cc = canvas.getContext('2d');

    const img = new Image();
    img.src = this.image;
    img.addEventListener('load', () => {
      // always start top left on the sub-canvas
      cc.drawImage(img, this.currentSourceCue, 0, this.sourceWidth, img.height,
          0, 0, this.targetWidth, canvas.height);
    });
  }
}

export default ImageCanvasHook;
