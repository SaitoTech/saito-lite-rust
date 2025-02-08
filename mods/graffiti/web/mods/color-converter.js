import Utils from "./utils.js";

class ColorConverter {
  static rgba_fromHsva(hsvaColor) {
    if (hsvaColor === null) {
      return null;
    } else {
      const {hue: H, saturation: s, value: v, alpha: A} = hsvaColor;

      const c = v * s;
      const x = c * (1 - Math.abs((H / 60) % 2 - 1));
      const m = v - c;
      
      const [r, g, b] = (  0 <= H && H <  60) ? [c, x, 0] :
                        ( 60 <= H && H < 120) ? [x, c, 0] :
                        (120 <= H && H < 180) ? [0, c, x] :
                        (180 <= H && H < 240) ? [0, x, c] :
                        (240 <= H && H < 300) ? [x, 0, c] :
                        (300 <= H && H < 360) ? [c, 0, x] : [undefined, undefined, undefined];

      const R = Math.round((r + m) * 255);
      const G = Math.round((g + m) * 255);
      const B = Math.round((b + m) * 255);

      return {red: R, green: G, blue: B, alpha: A};
    }
  }
  
  static hsva_fromRgba(rgbaColor) {
    if (rgbaColor === null) {
      return null;
    } else {
      const {red: R, green: G, blue: B, alpha: A} = rgbaColor;

      const r = R / 255;
      const g = G / 255;
      const b = B / 255;

      const cMax = Math.max(r, g, b);
      const cMin = Math.min(r, g, b);
      const delta = cMax - cMin;
      
      const H = (delta === 0) ? 0 :
                (cMax === r)  ? 60 * Utils.modulo((g - b) / delta + 0, 6) :
                (cMax === g)  ? 60 * Utils.modulo((b - r) / delta + 2, 6) :
                (cMax === b)  ? 60 * Utils.modulo((r - g) / delta + 4, 6) : undefined;
      const s = (cMax === 0) ? 0 : delta / cMax;
      const v = cMax;

      return {hue: H, saturation: s, value: v, alpha: A};
    }
  }

  static rgbaCSS_fromRgba(rgbaColor) {
    const [R, G, B, A] = [rgbaColor.red, rgbaColor.green, rgbaColor.blue, rgbaColor.alpha / 255 * 100].map(Math.round);
    return `rgba(${R} ${G} ${B} / ${A}%)`;
  }

  static rgbCSS_fromRgba(rgbaColor) {
    const [R, G, B] = [rgbaColor.red, rgbaColor.green, rgbaColor.blue].map(Math.round);
    return `rgb(${R} ${G} ${B})`;
  }
}

export default ColorConverter;