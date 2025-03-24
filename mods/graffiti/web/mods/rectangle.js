import ColorConverter from "./color-converter.js";
import ShapeBox from "./shape-box.js";
import Shape from "./shape.js";
import Utils from "./utils.js";


class Rectangle extends Shape {
  constructor({start, end, rgbaColor}) {
    super();

    this.start = start;
    this.end = end;
    this.rgbaColor = rgbaColor;
  }

  get box() {
    const left   = Math.min(this.start.i, this.end.i);
    const right  = Math.max(this.start.i, this.end.i);
    const top    = Math.min(this.start.j, this.end.j);
    const bottom = Math.max(this.start.j, this.end.j);

    return new ShapeBox({corners: {
      left:   {i: left,  j: top   },
      right:  {i: right, j: bottom},
      top:    {i: right, j: top   },
      bottom: {i: left,  j: bottom}
    }});
  }

  displaced(displacement) {
    return new Rectangle({
      start: Utils.displacedPosition(this.start, displacement),
      end: Utils.displacedPosition(this.end, displacement),
      rgbaColor: this.rgbaColor
    });
  }

  draw(layer) {
    const left   = Math.min(this.start.i, this.end.i);
    const right  = Math.max(this.start.i, this.end.i);
    const top    = Math.min(this.start.j, this.end.j);
    const bottom = Math.max(this.start.j, this.end.j);

    const width  = right - left + 1;
    const height = bottom - top + 1;

    layer.ctx.clearRect(left, top, width, height);
    if (this.rgbaColor !== null) {
      layer.ctx.fillStyle = ColorConverter.rgbaCSS_fromRgba(this.rgbaColor);
      layer.ctx.fillRect(left, top, width, height);
    }
  }
}

export default Rectangle;