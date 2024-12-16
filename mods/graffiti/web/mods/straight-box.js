import Utils, { INF } from "./utils.js";


class StraightBox {
  #left; #right; #top; #bottom;

  constructor(bounds) {
    if (bounds) {
      this.bounds = bounds;
    } else {
      this.reset();
    }
  }

  reset() {
    this.bounds = this.defaultUnionBounds();
  }

  defaultUnionBounds() {
    return {
      left: +INF, right:  -INF,
      top:  +INF, bottom: -INF
    };
  }

  set bounds({left, right, top, bottom}) {
    this.#left   = left;
    this.#right  = right;
    this.#top    = top;
    this.#bottom = bottom;

    this.width  = this.#right - this.#left;
    this.height = this.#bottom - this.#top;
  }

  set left(left) {
    this.#left = left;
    this.width = this.#right - this.#left;
  }

  set right(right) {
    this.#right = right;
    this.height = this.#right - this.#left;
  }

  set top(top) {
    this.#top = top;
    this.height = this.#bottom - this.#top;
  }

  set bottom(bottom) {
    this.#bottom = bottom;
    this.height = this.#bottom - this.#top;
  }

  get bounds() {
    return {left: this.#left, right: this.#right, top: this.#top, bottom: this.#bottom};
  }

  get left() {
    return this.#left;
  }

  get right() {
    return this.#right;
  }

  get top() {
    return this.#top;
  }

  get bottom() {
    return this.#bottom;
  }

  displaced(displacement) {
    return new StraightBox(Utils.objectSum(this.bounds, displacement));
  }

  copy() {
    return new StraightBox(this.bounds);
  }

  static unionHull(straightBox1, straightBox2) {
    return new StraightBox({
      left:   Math.min(straightBox1.left,   straightBox2.left),
      right:  Math.max(straightBox1.right,  straightBox2.right),
      top:    Math.min(straightBox1.top,    straightBox2.top),
      bottom: Math.max(straightBox1.bottom, straightBox2.bottom)
    });
  }

  static intersection(straightBox1, straightBox2) {
    return new StraightBox({
      left:   Math.max(straightBox1.left,   straightBox2.left),
      right:  Math.min(straightBox1.right,  straightBox2.right),
      top:    Math.max(straightBox1.top,    straightBox2.top),
      bottom: Math.min(straightBox1.bottom, straightBox2.bottom)
    });
  }
}

export default StraightBox;