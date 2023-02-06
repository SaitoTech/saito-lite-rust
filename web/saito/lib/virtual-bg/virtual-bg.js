const script = document.createElement('script');
script.type = 'text/javascript';
script.src =
  'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js';
script.crossOrigin = 'anonymous';

document.getElementsByTagName('head')[0].appendChild(script);

const foregroundCanvasElement = document.createElement('canvas');
const backgroundCanvasElement = document.createElement('canvas');
const backgroundCanvasCtx = backgroundCanvasElement.getContext('2d');

let outputCanvasCtx = null;
let effectType = 'blur'; // blur | video | image
let backgroundImage = null;
let backgroundVideo = null;
let foregroundType = 'normal'; // normal | presenter
let presenterModeOffset = 0;

 async function segmentBackground(
  inputVideoElement,
  outputCanvasElement,
  modelSelection = 1
) {
  foregroundCanvasElement.width = backgroundCanvasElement.width =
    outputCanvasElement.width;
  foregroundCanvasElement.height = backgroundCanvasElement.height =
    outputCanvasElement.height;
  outputCanvasCtx = outputCanvasElement.getContext('2d');

  let selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });
  selfieSegmentation.setOptions({
    modelSelection: modelSelection,
  });
  selfieSegmentation.onResults((results) => {
    mergeForegroundBackground(
      foregroundCanvasElement,
      backgroundCanvasElement,
      results
    );
  });

  inputVideoElement.addEventListener('play', () => {
    async function step() {
      await selfieSegmentation.send({ image: inputVideoElement });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function mergeForegroundBackground(
  foregroundCanvasElement,
  backgroundCanvasElement,
  results
) {
  makeCanvasLayer(results, foregroundCanvasElement, 'foreground');
  if (effectType === 'blur')
    makeCanvasLayer(results, backgroundCanvasElement, 'background');
  else if (effectType === 'image') {
    backgroundCanvasCtx.drawImage(
      backgroundImage,
      0,
      0,
      backgroundCanvasElement.width,
      backgroundCanvasElement.height
    );
  } else if (effectType === 'video') {
    backgroundCanvasCtx.drawImage(
      backgroundVideo,
      0,
      0,
      backgroundCanvasElement.width,
      backgroundCanvasElement.height
    );
  }
  outputCanvasCtx.drawImage(backgroundCanvasElement, 0, 0);
  if (foregroundType === 'presenter')
    outputCanvasCtx.drawImage(
      foregroundCanvasElement,
      foregroundCanvasElement.width * 0.5 - presenterModeOffset,
      foregroundCanvasElement.height * 0.5,
      foregroundCanvasElement.width * 0.5,
      foregroundCanvasElement.height * 0.5
    );
  else outputCanvasCtx.drawImage(foregroundCanvasElement, 0, 0);
}

function makeCanvasLayer(results, canvasElement, type) {
  const canvasCtx = canvasElement.getContext('2d');

  canvasCtx.save();

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.segmentationMask,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (type === 'foreground') {
    canvasCtx.globalCompositeOperation = 'source-in';
  }

  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  canvasCtx.restore();
}

 function applyBlur(blurIntensity = 7) {
  effectType = 'blur';
  foregroundType = 'normal';
  backgroundCanvasCtx.filter = `blur(${blurIntensity}px)`;
}

 function applyImageBackground(image) {
  backgroundImage = image;
  foregroundType = 'normal';
  effectType = 'image';
}

 function applyVideoBackground(video) {
  backgroundVideo = video;
  video.autoplay = true;
  video.loop = true;
  video.addEventListener('play', () => {
    video.muted = true;
  });
  effectType = 'video';
}

 function applyScreenBackground(stream) {
  const videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  backgroundVideo = videoElement;

  videoElement.autoplay = true;
  videoElement.loop = true;
  videoElement.addEventListener('play', () => {
    videoElement.muted = true;
  });
  effectType = 'video';
}

 function changeForegroundType(type, offset = 0) {
  foregroundType = type;
  presenterModeOffset = offset;
}


