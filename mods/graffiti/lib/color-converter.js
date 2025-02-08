class ColorConverter {
  static rgba_fromHex(hexColor) {
    if (hexColor === null) {
      return null;
    } else {
      return {
        red:   parseInt(hexColor.substring(1, 3), 16),
        green: parseInt(hexColor.substring(3, 5), 16),
        blue:  parseInt(hexColor.substring(5, 7), 16),
        alpha: 255
      };
    }
  }
}

export default ColorConverter;