/*
* virtual-dom hook for drawing an image to the canvas element.
*/
class ImageCanvasHook {
  constructor(image, offset) {
    this.image = image;
    this.offset = offset;
  }

  hook(canvas) {
    const cc = canvas.getContext('2d');

    const img = new Image();
    img.src = this.image;
    img.addEventListener('load', () => {
      cc.drawImage(img, this.offset, 0, 100, 30, 0, 0, canvas.width, canvas.height);
    });
  }
}

export default ImageCanvasHook;
