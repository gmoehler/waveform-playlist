/*
* virtual-dom hook for drawing an image to the canvas element.
*/
class ImageCanvasHook {
  constructor(offset) {
    this.offset = offset;
  }

  hook(canvas) {
    const cc = canvas.getContext('2d');

    const img = new Image();
    img.src = 'media/image/poi.png';
    img.addEventListener('load', () => {
      cc.drawImage(img, this.offset, 0, 100, 30, 0, 0, canvas.width, canvas.height);
    });
  }
}

export default ImageCanvasHook;
