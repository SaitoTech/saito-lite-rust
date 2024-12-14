import ColorConverter from "./color-converter.js";
import ShapeBox from "./shape-box.js";
import Shape from "./shape.js";
import Utils from "./utils.js";


class Ellipse extends Shape {
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
    return new Ellipse({
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

    const center = {i: (left + right) / 2, j: (top + bottom) / 2};
    const radius = {i: (right - left + 1) / 2, j: (bottom - top + 1) / 2};

    layer.ctx.beginPath();
    layer.ctx.ellipse(center.i, center.j, radius.i, radius.j, 0, 0, 2 * Math.PI);

    layer.ctx.fillStyle = ColorConverter.rgbaCSS_fromRgba(this.rgbaColor);
    layer.ctx.fill();
  }
}

export default Ellipse;