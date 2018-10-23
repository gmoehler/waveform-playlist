/*
* virtual-dom hook for drawing an image to the canvas element.
*/
class ImageCanvasHook {
  constructor(image, offset, xStrech) {
    this.image = image;
    this.offset = offset;
    this.xStrech = xStrech;
  }

  hook(canvas) {
    const cc = canvas.getContext('2d');

    const img = new Image();
    img.src = this.image;
    img.addEventListener('load', () => {
      const remainingWidth = img.width - this.offset;
      const wantedWidth = remainingWidth * this.xStrech;
      cc.drawImage(img, this.offset, 0, remainingWidth, img.height, 0, 0, wantedWidth, canvas.height);
    });
  }
}

export default ImageCanvasHook;
