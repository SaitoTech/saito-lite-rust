module.exports = SaitoCameraTemplate = () => {
	return `<div class="saito-camera">
			  <canvas id="canvas" style="display:none;"> </canvas>

			  <video id="video">Video stream not available.</video>
		      <img id="photo-preview" alt="The screen capture will appear in this box." />

		      <div class="camera-controls video">
		      	<i id="retake" class="fa-solid fa-circle-xmark second-phase"></i>
			  	<i id="startbutton" class="fa-regular fa-circle-dot first-phase"></i>
			  	<i id="accept" class="fa-solid fa-circle-check second-phase"></i>
			  </div>

			</div>
			`;
}