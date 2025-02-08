import ShapeBox from "./shape-box.js";
import Shape from "./shape.js";
import Utils from "./utils.js";


class ImageShape extends Shape {
  constructor({content, position, sizeOnLayer}) {
    super();

    this.content = content;
    this.position = position;
    this.sizeOnLayer = sizeOnLayer;
  }

  get box() {
    const left   = this.position.i;
    const right  = this.position.i + this.sizeOnLayer.width - 1;
    const top    = this.position.j;
    const bottom = this.position.j + this.sizeOnLayer.height - 1;

    return new ShapeBox({corners: {
      left:   {i: left,  j: top   },
      right:  {i: right, j: bottom},
      top:    {i: right, j: top   },
      bottom: {i: left,  j: bottom}
    }});
  }

  displaced(displacement) {
    return new ImageShape({
      content: this.content,
      position: Utils.displacedPosition(this.position, displacement),
      sizeOnLayer: this.sizeOnLayer
    });
  }

  draw(layer) {
    layer.ctx.drawImage(
      this.content, 0, 0, this.content.width, this.content.height,
      this.position.i, this.position.j, this.sizeOnLayer.width, this.sizeOnLayer.height
    );
  }
}

export default ImageShape;