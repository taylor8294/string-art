export class Transformation {
  constructor(size1, size2) {
    var widthScale = size1.width / size2.width;
    var heightScale = size1.height / size2.height;
    this.scaling = Math.min(widthScale, heightScale);
    this.origin = {
      x : 0.5 * (size1.width - this.scaling * size2.width),
      y : 0.5 * (size1.height - this.scaling * size2.height)
    };
  }
  transform(point) {
    return{
      x : this.origin.x + point.x * this.scaling,
      y : this.origin.y + point.y * this.scaling
    };
  }
}