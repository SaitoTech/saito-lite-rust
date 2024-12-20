class Utils {
  static SIDES = ["left", "right", "top", "bottom"];
  static DIRECTIONS = ["horizontal", "vertical"];
  static CONTINOUS_COORDINATES_NAMES = ["x", "y"];


  static sign_fromSide(side) {
    return {
      left: -1, right:  +1,
      top:  -1, bottom: +1
    }[side] ?? 0;
  }

  static discreteCoordinateName_fromSide(side) {
    return {
      left: "i", right:  "i",
      top:  "j", bottom: "j"
    }[side];
  }

  static continuousCoordinateName_fromSide(side) {
    const direction = this.direction_fromSide(side);
    return this.continuousCoordinateName_fromDirection(direction);
  }

  static continuousCoordinateName_fromDirection(direction) {
    return {horizontal: "x", vertical: "y"}[direction];
  }

  static transposedSide(side) {
    return {
      left: "top",  right:  "bottom",
      top:  "left", bottom: "right"
    }[side];
  }

  static otherDirection(direction) {
    return this.otherOne(direction, this.DIRECTIONS);
  }

  static negativeSide_fromDirection(direction) {
    return {horizontal: "left", vertical: "top"}[direction];
  }

  static positiveSide_fromDirection(direction) {
    return {horizontal: "right", vertical: "bottom"}[direction];
  }

  static positiveSide_fromDimensionName(dimensionName) {
    const direction = this.direction_fromDimensionName(dimensionName);
    return this.positiveSide_fromDirection(direction);
  }

  static negativeSide_fromDimensionName(dimensionName) {
    const direction = this.direction_fromDimensionName(dimensionName);
    return this.negativeSide_fromDirection(direction);
  }

  static direction_fromDimensionName(dimensionName) {
    return {width: "horizontal", height: "vertical"}[dimensionName];
  }

  static dimensionName_fromDirection(direction) {
    return {horizontal: "width", vertical: "height"}[direction];
  }

  static sides_fromDirection(direction) {
    return [
      this.negativeSide_fromDirection(direction),
      this.positiveSide_fromDirection(direction)
    ];
  }

  static direction_fromSide(side) {
    return {
      left: "horizontal", right:  "horizontal",
      top:  "vertical",   bottom: "vertical"
    }[side];
  }

  static orthogonalSides(side) {
    const direction = this.direction_fromSide(side);
    const otherDirection = this.otherDirection(direction);
    
    return this.sides_fromDirection(otherDirection);
  }

  static displacedPosition(position, displacement) {
    return this.objectSum(position, displacement);
  }

  static displacement_fromPositions(startPosition, endPosition) {
    return this.objectDifference(endPosition, startPosition);
  }

  static objectFrom(keyArray, map) {
    return Object.fromEntries(keyArray.map((key) => [key, map(key)]));
  }

  static objectMap(map, ...objs) {
    return Object.fromEntries(Object.keys(objs[0]).map((key) => [key, map(...objs.map((obj) => obj[key]))]));
  }

  static objectSum(obj1, obj2) {
    return this.objectMap((a, b) => a + b, obj1, obj2);
  }

  static objectDifference(obj1, obj2) {
    return this.objectSum(obj1, this.objectOpposite(obj2));
  }

  static objectOpposite(obj) {
    return this.objectMap((a) => -a, obj);
  }

  static sum(array) {
    return array.reduce((partialSum, x) => partialSum + x, 0);
  }

  static mean(array) {
    return this.sum(array) / array.length;
  }

  static modulo(n, d) {
    return ((n % d) + d) % d;
  }

  static gcd(a, b) {
    return (b !== 0) ? this.gcd(b, a % b) : a;
  }

  static round(x, nbPlaces) {
    const tenPower = 10 ** nbPlaces;
    return Math.round((x + Number.EPSILON) * tenPower) / tenPower;
  }

  static ceil(x, nbPlaces) {
    const tenPower = 10 ** nbPlaces;
    return Math.ceil(x * tenPower) / tenPower;
  }

  static linearFunction({x1, y1}, {x2, y2}) {
    return (x) => y1 + (y2 - y1)/(x2 - x1) * (x - x1);
  }

  static boundedPercentageValue(old_value) {
    return Math.min(Math.max(0, old_value), 100);
  }

  static otherOne(element, pair) {
    return pair[(pair.indexOf(element) + 1) % 2];
  }

  static firstLetterUppercaseWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  static shallowCopy(obj) {
    return Object.assign({}, obj);
  }

  static px_fromRem(rem) {    
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
}

export default Utils;

export const INF = Number.POSITIVE_INFINITY;