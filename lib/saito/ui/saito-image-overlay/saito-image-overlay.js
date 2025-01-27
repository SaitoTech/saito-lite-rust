const SaitoOverlay = require('./../saito-overlay/saito-overlay');
const SaitoImageOverlayTemplate = require('./saito-image-overlay.template');

class SaitoImageOverlay {
	constructor(app, mod, image_array) {
		this.app = app;
		this.mod = mod;
		this.image_array = image_array;
		this.image_idx = 0;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(image_idx = -1) {
		let io_self = this;

		//
		// allow rendering from arbitrary points
		//
		if (image_idx > -1) {
			this.image_idx = image_idx;
		}

		this.overlay.show(SaitoImageOverlayTemplate(this.app, this.mod));

		if (this.image_array.length == 1) {
			this.hideArrowLeft();
			this.hideArrowRight();
		}

		this.image_array.forEach((img, idx) => {
			let oImg = document.createElement('img');
			oImg.setAttribute('src', img);
			oImg.setAttribute('data-index', idx);
			oImg.setAttribute('class', 'saito-overlay-img');
			oImg.setAttribute('id', 'saito-overlay-img-' + idx);

			document.querySelector('#saito-overlay-img-cont').appendChild(oImg);

			//
			// and show selected
			//
			if (io_self.image_idx == idx) {
				this.showImage(idx);
			} 
		});

		this.attachEvents();
	}

	attachEvents() {
		document
			.getElementById('saito-img-arrow-box-left')
			.addEventListener('click', (e) => {
				this.image_idx--;
				if (this.image_idx <= 0) {
					this.image_idx = 0;
				}
				this.hideAllImgs();
				this.showImage(this.image_idx);
			});

		document
			.getElementById('saito-img-arrow-box-right')
			.addEventListener('click', (e) => {
				this.image_idx++;
				if (this.image_idx >= this.image_array.length) {
					this.image_idx = this.image_array.length - 1;
				}
				this.hideAllImgs();
				this.showImage(this.image_idx);
			});

		//
		// keypress events
		//
		document.onkeydown = (event) => {
			// left
			if (event.keyCode === 37) {
				let obj = document.getElementById('saito-img-arrow-box-left');
				if (obj) {
					if (obj.style.display != 'none') {
						document
							.getElementById('saito-img-arrow-box-left')
							.click();
					}
				}
			}

			// right
			if (event.keyCode === 39) {
				let obj = document.getElementById('saito-img-arrow-box-right');
				if (obj) {
					if (obj.style.display != 'none') {
						document
							.getElementById('saito-img-arrow-box-right')
							.click();
					}
				}
			}

			// right
			if (event.keyCode === 27) {
				this.overlay.remove();
			}
		};
	}

	showImage(idx) {
		let img_showing = document.querySelector('#saito-overlay-img-' + idx);
		if (img_showing) {
			img_showing.style.display = 'block';
			setTimeout(()=> { this.checkArrows(img_showing); }, 100);
		}
	}

	checkArrows(img) {
		this.showArrows();

		if (this.image_idx <= 0) {
			this.hideArrowLeft();
		}

		if (this.image_idx >= this.image_array.length - 1) {
			this.hideArrowRight();
		}

		console.log(img);

		let buffer = window.innerWidth > 535 ? 30 : 0;
		let img_pos = img.getBoundingClientRect();
		let left_arrow_pos = img_pos.x - buffer;
		let right_arrow_pos =
			window.innerWidth - img_pos.x - img_pos.width - buffer;

		console.log(img_pos, window.innerWidth, buffer);
		console.log(left_arrow_pos, right_arrow_pos);

		if (document.querySelector('#saito-img-arrow-box-left')) {
			document.querySelector('#saito-img-arrow-box-left').style.left =
				'-' + left_arrow_pos + 'px';
		}
		if (document.querySelector('#saito-img-arrow-box-right')) {
			document.querySelector('#saito-img-arrow-box-right').style.right =
				'-' + right_arrow_pos + 'px';
		}
	}

	hideAllImgs() {
		document.querySelectorAll('.saito-overlay-img').forEach(function (img) {
			img.style.display = 'none';
		});
		this.hideArrowLeft();
		this.hideArrowRight()
	}

	showArrows() {
		if (document.querySelector('#saito-img-arrow-box-left')) {
			document.querySelector('#saito-img-arrow-box-left').style.display =
				'block';
		}
		if (document.querySelector('#saito-img-arrow-box-right')) {
			document.querySelector('#saito-img-arrow-box-right').style.display =
				'block';
		}
	}

	hideArrowLeft() {
		if (document.querySelector('#saito-img-arrow-box-left')) {
			document.querySelector('#saito-img-arrow-box-left').style.display =
				'none';
		}
	}

	hideArrowRight() {
		if (document.querySelector('#saito-img-arrow-box-right')) {
			document.querySelector('#saito-img-arrow-box-right').style.display =
				'none';
		}
	}
}

module.exports = SaitoImageOverlay;
