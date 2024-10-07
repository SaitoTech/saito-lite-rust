module.exports  = () => {
	return `<div class="saito-camera video">
			  <canvas id="canvas"> </canvas>
			  <video id="video"><div class="saito-loader"></div></video>
		      <img id="photo-preview" alt="The screen capture will appear in this box." style="display:none;"/>

		      <div class="camera-controls">
		      	<i id="retake" class="fa-solid fa-circle-xmark second-phase"></i>
			  	<i id="startbutton" class="fa-regular fa-circle-dot first-phase"></i>
			  	<i id="accept" class="fa-solid fa-circle-check second-phase"></i>
			  </div>
			  <i id="flip" class="fa-solid fa-camera-rotate first-phase"></i>
			</div>
			`;
};
