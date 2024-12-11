import ColorConverter from "./color-converter.js";
import ShapeBox from "./shape-box.js";
import Shape from "./shape.js";
import Utils from "./utils.js";


class Line extends Shape {
  constructor({toolName, start, end, rgbaColor, width}) {
    super();

    this.toolName = toolName;
    this.start = start;
    this.end = end;
    this.rgbaColor = rgbaColor;
    this.width = width;
  }

  get box() {
    const extra = 2;

    const [P, Q] = [this.start, this.end];
    const PQ = Math.sqrt((P.i - Q.i)**2 + (P.j - Q.j)**2);
    const w = this.width;
    const eps = extra;
    
    const [E, F, G, H] = (PQ !== 0) ? [
      {i: P.i + ( P.i - Q.i - P.j + Q.j) / PQ * (w/2 + eps), j: P.j + ( P.i - Q.i + P.j - Q.j) / PQ * (w/2 + eps)},
      {i: P.i + ( P.i - Q.i + P.j - Q.j) / PQ * (w/2 + eps), j: P.j + (-P.i + Q.i + P.j - Q.j) / PQ * (w/2 + eps)},
      {i: Q.i + (-P.i + Q.i - P.j + Q.j) / PQ * (w/2 + eps), j: Q.j + ( P.i - Q.i - P.j + Q.j) / PQ * (w/2 + eps)},
      {i: Q.i + (-P.i + Q.i + P.j - Q.j) / PQ * (w/2 + eps), j: Q.j + (-P.i + Q.i - P.j + Q.j) / PQ * (w/2 + eps)}
    ] : [
      {i: P.i - (w/2 + eps), j: P.j - (w/2 + eps)},
      {i: P.i - (w/2 + eps), j: P.j + (w/2 + eps)},
      {i: Q.i + (w/2 + eps), j: Q.j - (w/2 + eps)},
      {i: Q.i + (w/2 + eps), j: Q.j + (w/2 + eps)}
    ];
    
    const [L, R, T, B] = (P.i <= Q.i && P.j <  Q.j) ? [F, G, E, H] :
                         (P.i <= Q.i && P.j >= Q.j) ? [E, H, G, F] :
                         (P.i >  Q.i && P.j <  Q.j) ? [H, E, F, G] :
                         (P.i >  Q.i && P.j >= Q.j) ? [G, F, H, E] : [undefined, undefined, undefined, undefined];

    return new ShapeBox({corners: {
      left:   {i: Math.round(L.i), j: Math.round(L.j)},
      right:  {i: Math.round(R.i), j: Math.round(R.j)},
      top:    {i: Math.round(T.i), j: Math.round(T.j)},
      bottom: {i: Math.round(B.i), j: Math.round(B.j)}
    }});
  }

  displaced(displacement) {
    return new Line({
      toolName: this.toolName,
      start: Utils.displacedPosition(this.start, displacement),
      end: Utils.displacedPosition(this.end, displacement),
      rgbaColor: this.rgbaColor, width: this.width
    });
  }

  draw(layer) {
    layer.ctx.lineWidth = this.width;

    layer.ctx.beginPath();
    layer.ctx.moveTo(this.start.i + 0.5, this.start.j + 0.5);

    layer.ctx.lineCap = {brush: "round", line: "square"}[this.toolName];
    layer.ctx.lineTo(this.end.i + 0.5, this.end.j + 0.5);

    layer.ctx.strokeStyle = ColorConverter.rgbaCSS_fromRgba(this.rgbaColor);
    layer.ctx.stroke();
  }
}

export default Line;