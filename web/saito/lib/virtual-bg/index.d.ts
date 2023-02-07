export function segmentBackground(
  inputVideoElement: HTMLVideoElement,
  outputCanvasElement: HTMLCanvasElement,
  modelSelection?: 0 | 1
): any;

export function applyBlur(blurIntensity?: number): any;
export function applyImageBackground(image: HTMLImageElement): any;
export function applyVideoBackground(video: HTMLVideoElement): any;
export function applyScreenBackground(stream: MediaStream): any;
export function changeForegroundType(
  type: 'normal' | 'presenter',
  offset?: number
): any;
