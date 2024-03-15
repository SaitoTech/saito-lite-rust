const VideoBox = require('../../../lib/saito/ui/saito-videobox/video-box');
const DreamSpaceTemplate = require("./dream-space.template");

class DreamSpace{
	constructor(app, mod, container = "#limbo-main") {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.video = new VideoBox(app, mod, "presentation", "video-preview");
	}

	render(stream) {
		if (!document.getElementById("dream-controls")){

			console.log("Render Dream space in " + this.container);
			this.app.browser.addElementToSelectorOrDom(DreamSpaceTemplate(), this.container);
		}

		if (stream){
			this.video.render(stream);
		}

		this.attachEvents();
	}

	remove(){
		this.video.remove();
		if (document.getElementById("dream-controls")){
			document.getElementById("dream-controls").remove();
		}
	}

	attachEvents(){

	}



}

module.exports = DreamSpace;
