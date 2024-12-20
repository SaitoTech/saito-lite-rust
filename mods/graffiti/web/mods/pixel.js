import Shape from "./shape.js";
import Rectangle from "./rectangle.js";
import Utils from "./utils.js";


class Pixel extends Shape {
  constructor({position, rgbaColor}) {
    super();

    this.position = position;
    this.rgbaColor = rgbaColor;
  }

  toRectangle() {
    return new Rectangle({
      start: this.position,
      end: this.position,
      rgbaColor: this.rgbaColor
    });
  }

  get box() {
    return this.toRectangle().box;
  }

  displaced(displacement) {
    return new Pixel({
      position: Utils.displacedPosition(this.position, displacement),
      rgbaColor: this.rgbaColor
    });
  }

  draw(layer) {
    this.toRectangle().draw(layer);
  }
}

export default Pixel;