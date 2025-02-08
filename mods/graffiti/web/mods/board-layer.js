import Rectangle from "./rectangle.js";
import ImageShape from "./image-shape.js";
import StraightBox from "./straight-box.js";
import ShapeBox from "./shape-box.js";
import Utils from "./utils.js";


class BoardLayer {
  #shapeBoxes; #layerBox;

  constructor(boardWidth, boardHeight, zIndex=null, layerName=null) {
    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("layer-canvas");
    this.canvas.id = (layerName !== null) ? (layerName + "-layer-canvas") : undefined;
    this.canvas.width  = boardWidth;
    this.canvas.height = boardHeight;
    this.ctx = this.canvas.getContext("2d", {willReadFrequently: true});
    if (zIndex !== null) {
      this.canvas.style.zIndex = `${zIndex}`;
    }

    this.displacement = {left: 0, right: 0, top: 0, bottom: 0};
    this.shapes = [];
    this.#shapeBoxes = {
      current:  {list: [], unionHullBox: new StraightBox()},
      original: {list: [], unionHullBox: new StraightBox()}
    };
    this.#layerBox = {
      current:  new StraightBox(),
      original: new StraightBox()
    };

    this.hasBeenResized   = false;
    this.hasBeenDisplaced = false;
  }

  get layerBox() {
    return this.#layerBox.current;
  }

  get shapeBoxes() {
    return this.#shapeBoxes.current.list;
  }

  get unionHullBox() {
    return this.#shapeBoxes.current.unionHullBox;
  }

  updateLayerBox() {
    this.#layerBox.current = StraightBox.intersection(this.#shapeBoxes.current.unionHullBox, this.boardBox());
  }

  boardBox() {
    return new StraightBox({
      left: 0, right:  this.canvas.width,
      top:  0, bottom: this.canvas.height
    });
  }

  copyCurrentToOriginal() {
    this.#shapeBoxes.original.list = this.#shapeBoxes.current.list.map((currentShapeBox) => currentShapeBox.copy());
    this.#shapeBoxes.original.unionHullBox = this.#shapeBoxes.current.unionHullBox.copy();
    this.#layerBox.original = this.#layerBox.current.copy();
  }

  mouseDisplacement(old_mousePosition, new_mousePosition) {
    return {
      i: Math.round(new_mousePosition.i_float) - Math.round(old_mousePosition.i_float),
      j: Math.round(new_mousePosition.j_float) - Math.round(old_mousePosition.j_float)
    };
  }

  resize(old_mousePosition, new_mousePosition, resizingSides) {
    if (!this.hasBeenDisplaced) {
      this.copyCurrentToOriginal();
    }
    const imageContent = this.hasBeenResized ? this.shapes[0].content : this.getCurrentContentCanvas();

    
    const aspectRatio = this.#shapeBoxes.current.unionHullBox.width / this.#shapeBoxes.current.unionHullBox.height;
    const mouseDisplacement = this.mouseDisplacement(old_mousePosition, new_mousePosition);
    const new_layerDisplacement = Utils.objectFrom(Utils.SIDES, (side) => 
      (resizingSides[side] === "master")  ? mouseDisplacement[Utils.discreteCoordinateName_fromSide(side)] :
      (resizingSides[side] === "subject") ? Math.round(
        ((resizingSides[Utils.transposedSide(side)] === "master") ? +1 : -1)
        * aspectRatio ** ((Utils.direction_fromSide(side) === "horizontal") ? +1 : -1)
        * mouseDisplacement[Utils.discreteCoordinateName_fromSide(Utils.transposedSide(side))]
      ) : 0
    );


    this.clearCanvas();
    this.accumulateDisplacement(new_layerDisplacement);
    this.displaceShapeBoxes();

    this.clearShapes();
    this.addShape(new ImageShape({
      content: imageContent,
      position: {i: this.#shapeBoxes.current.unionHullBox.left, j: this.#shapeBoxes.current.unionHullBox.top},
      sizeOnLayer: {width: this.#shapeBoxes.current.unionHullBox.width, height: this.#shapeBoxes.current.unionHullBox.height}
    }), false);

    this.hasBeenResized   = true;
    this.hasBeenDisplaced = true;
  }

  getCurrentContentCanvas() {
    const contentData = this.ctx.getImageData(
      this.#layerBox.current.left,  this.#layerBox.current.top,
      this.#layerBox.current.width, this.#layerBox.current.height
    );

    const contentCanvas = new OffscreenCanvas(this.#layerBox.current.width, this.#layerBox.current.height);
    const contentCtx = contentCanvas.getContext("2d");
    contentCtx.putImageData(contentData, 0, 0);
    
    return contentCanvas;
  }

  drawTiles(tileArray) {
    const layerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    for (const tile of tileArray) {
      const index = 4 * (tile.j * this.canvas.width + tile.i);
      layerData.data[index + 0] = (tile.rgbaColor !== null) ? tile.rgbaColor.red   : 0;
      layerData.data[index + 1] = (tile.rgbaColor !== null) ? tile.rgbaColor.green : 0;
      layerData.data[index + 2] = (tile.rgbaColor !== null) ? tile.rgbaColor.blue  : 0;
      layerData.data[index + 3] = (tile.rgbaColor !== null) ? tile.rgbaColor.alpha : 0;
    }
    this.ctx.putImageData(layerData, 0, 0);
  }

  move(old_mousePosition, new_mousePosition) {
    if (!this.hasBeenDisplaced) {
      this.copyCurrentToOriginal();
    }


    const mouseDisplacement = this.mouseDisplacement(old_mousePosition, new_mousePosition);
    const new_layerDisplacement = {
      left: mouseDisplacement.i, right:  mouseDisplacement.i,
      top:  mouseDisplacement.j, bottom: mouseDisplacement.j
    };


    this.clearCanvas();
    this.accumulateDisplacement(new_layerDisplacement);
    this.displaceShapeBoxes();

    const old_shapes = this.clearShapes();
    for (const old_shape of old_shapes) {
      this.addShape(old_shape.displaced(mouseDisplacement), false);
    }

    this.hasBeenDisplaced = true;
  }

  addShape(shape, addNewShapeBox=true) {
    if (addNewShapeBox) {
      this.addShapeBox(shape.box);
    }
    shape.draw(this);
    this.shapes.push(shape);
  }

  clearCanvas() {
    this.boardRectangle(null).draw(this);
  }

  accumulateDisplacement(additionalDisplacement) {
    this.displacement = Utils.objectSum(this.displacement, additionalDisplacement);
  }

  displaceShapeBoxes() {
    this.#shapeBoxes.current.list = this.#shapeBoxes.original.list.map((originalShapeBox) => this.displacedShapeBox(originalShapeBox));
    this.#shapeBoxes.current.unionHullBox = this.displacedStraightBox(this.#shapeBoxes.original.unionHullBox);
    
    this.updateLayerBox();
  }

  displacedShapeBox(shapeBox) {
    return new ShapeBox({corners: Utils.objectMap((corner) => this.displacedPosition(corner), shapeBox.corners)});
  }

  displacedStraightBox(straightBox) {
    return new StraightBox({
      left: this.displacedCoordinate("i", straightBox.left), right:  this.displacedCoordinate("i", straightBox.right  - 1) + 1,
      top:  this.displacedCoordinate("j", straightBox.top),  bottom: this.displacedCoordinate("j", straightBox.bottom - 1) + 1
    });
  }

  displacedPosition(position) {
    return {
      i: this.displacedCoordinate("i", position.i),
      j: this.displacedCoordinate("j", position.j)
    };
  }

  displacedCoordinate(coordinateName, coordinate) {
    const minBound = {i: "left",  j: "top"   }[coordinateName];
    const maxBound = {i: "right", j: "bottom"}[coordinateName];

    const original_unionHullBox = this.#shapeBoxes.original.unionHullBox;

    return Math.round(Utils.linearFunction(
      {x1: original_unionHullBox[minBound],     y1: original_unionHullBox[minBound] + this.displacement[minBound]    },
      {x2: original_unionHullBox[maxBound] - 1, y2: original_unionHullBox[maxBound] + this.displacement[maxBound] - 1}
    )(coordinate));
  }

  clearShapes() {
    const old_shapes = this.shapes;

    this.shapes = [];

    return old_shapes;
  }

  boardRectangle(rgbaColor) {
    return new Rectangle({
      start: {i: 0, j: 0},
      end: {i: this.canvas.width - 1, j: this.canvas.height - 1},
      rgbaColor: rgbaColor
    });
  }

  clear() {
    this.clearCanvas();
    this.clearShapes();
    this.clearShapeBoxes();
  }

  clearShapeBoxes() {
    this.#shapeBoxes.current.list = [];
    this.#shapeBoxes.current.unionHullBox.reset();

    this.updateLayerBox();
  }

  addShapeBox(shapeBox) {
    this.#shapeBoxes.current.list.push(shapeBox);
    this.#shapeBoxes.current.unionHullBox = StraightBox.unionHull(this.#shapeBoxes.current.unionHullBox, shapeBox.hullBox);

    this.updateLayerBox();
  }

  fill(rgbaColor, addNewShapeBox=true) {
    this.clearShapes();
    this.clearShapeBoxes();

    this.addShape(this.boardRectangle(rgbaColor), addNewShapeBox);
  }
}

export default BoardLayer;