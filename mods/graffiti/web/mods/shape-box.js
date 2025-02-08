import StraightBox from "./straight-box.js";
import Utils from "./utils.js";


class ShapeBox {
  constructor({corners}) {
    this.corners = corners;
  }

  copy() {
    return new ShapeBox({corners: Utils.shallowCopy(this.corners)});
  }

  get hullBox() {
    return new StraightBox({
      left: this.corners.left.i, right:  this.corners.right.i  + 1,
      top:  this.corners.top.j,  bottom: this.corners.bottom.j + 1
    });
  }
}

export default ShapeBox;