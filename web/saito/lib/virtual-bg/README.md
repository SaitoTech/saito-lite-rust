## Easily add virtual background effects to your video/camera input inside any web browser<br/>
#### Try a working demo [here](http://demo.virtualbg.akhilrana.com/)<br/><br/>

Install from npm using:

    npm install virtual-bg

or include directly in HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/virtual-bg@latest/virtual-bg.min.js"></script>
```
### A simple example to apply blur/image background to camera input:<br/>
#### index.html
```html
<div>
    <video autoplay="true" id="inputVideoElement"></video>
    <canvas id="output_canvas"></canvas>
</div>
```

#### index.js
```js
import { segmentBackground, applyBlur, applyImageBackground } from'virtual-bg';

const inputVideoElement = document.querySelector('#inputVideoElement');
const outputCanvasElement = document.querySelector('#output_canvas');

let myStream = await navigator.mediaDevices.getUserMedia({
      video: true
});

inputVideoElement.srcObject = myStream;

// segments foreground & background
segmentBackground(inputVideoElement, outputCanvasElement);  

// applies a blur intensity of 7px to the background 
applyBlur(7); 

// applies an image background
const image = new Image();
image.src = 'https://imageurl.jpg'
applyImageBackground(image);
```
### API:<br/>

#### To separate foreground from background: <br/>
```js
segmentBackground(inputVideoElement, outputCanvasElement, modelSelection <optional>); 
```
 Parameters: <br>
- <b>`inputVideoElement`:</b> <[HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)> Source of video which is to be used for applying segmentation.
- <b>`outputCanvasElement`:</b> <[HTMLCanvasElement](HTMLCanvasElement)> Canvas Element where output is to be displayed. 
- <b>`modelSelection`:</b> Numerical value to select type of model to be used for segmentation. <br/>0 : General <br/> 1 : Landscape (default)<br/> General (0) can be used when there is only 1 person in the view and not far away from the camera.<br/> Landscape works better if there are multiple people or distance from the camera is more.
#### To apply blur effect to background: <br/>
```js
applyBlur(blurIntensity <optional>); 
```
Parameters: </br>
- <b>`blurIntensity`:</b> Numerical value in pixels to apply a blur filter to the background. This uses the same filter as used in [CSS blur filter](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur())<br/> _default = 7_
#### To apply image to background: <br/>
```js
applyImageBackground(imageElement); 
```
Parameters: </br>
- <b>`imageElement`:</b> <[HTMLImageElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement)> Image element to be set as background. You can create a new element dynamically using the [Image()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) constructor.
#### To apply video to background: <br/>
```js
applyVideoBackground(videoElement); 
```
Parameters: </br>
- <b>`videoElement`:</b> <[HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)> Video element to be set as background.
#### To apply screen capture to background: <br/>
```js 
applyScreenBackground(screenCaptureStream); 
```
Parameters: </br>
- <b>`screenCaptureStream`:</b> <[MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)> Stream obtained from the [Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API)
#### To change foreground type. Can be used to set foreground as a smaller snip at the bottom right corner of the output like a YouTube/Twitch stream. <br/>
An example use case for this can be when user has set screen capture as the background and want to present something.
```js 
changeForegroundType(foregroundType, offset<optional>); 
```
Parameters: </br>
- <b>`foregroundType`: </b> `normal | presenter` Type of foreground. Presenter mode shrinks the foreground and displays it in the bottom right corner.
- <b>`offset`: </b> Numerical value in pixels for setting custom offset when presenter mode is selected.<br> _For example_: -100 offset will move the foreground by 100 pixels to the right.

<br/><br/>

<b>Note</b>: I'm using  [mediapipe's selfie segmentation](https://www.npmjs.com/package/@mediapipe/selfie_segmentation) model and library as a base. 


For any doubts/feedback/suggestions, please start an issue/discussion at https://github.com/akhil-rana/virtual-bg or contact me at contact@akhilrana.com