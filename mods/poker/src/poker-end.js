

	preloadImages() {
		let allImages = [
			'/poker/img/cards/C1.png',
			'/poker/img/cards/C2.png',
			'/poker/img/cards/C3.png',
			'/poker/img/cards/C4.png',
			'/poker/img/cards/C5.png',
			'/poker/img/cards/C6.png',
			'/poker/img/cards/C7.png',
			'/poker/img/cards/C8.png',
			'/poker/img/cards/C9.png',
			'/poker/img/cards/C10.png',
			'/poker/img/cards/C11.png',
			'/poker/img/cards/C12.png',
			'/poker/img/cards/C13.png',
			'/poker/img/cards/S1.png',
			'/poker/img/cards/S2.png',
			'/poker/img/cards/S3.png',
			'/poker/img/cards/S4.png',
			'/poker/img/cards/S5.png',
			'/poker/img/cards/S6.png',
			'/poker/img/cards/S7.png',
			'/poker/img/cards/S8.png',
			'/poker/img/cards/S9.png',
			'/poker/img/cards/S10.png',
			'/poker/img/cards/S11.png',
			'/poker/img/cards/S12.png',
			'/poker/img/cards/S13.png',
			'/poker/img/cards/D1.png',
			'/poker/img/cards/D2.png',
			'/poker/img/cards/D3.png',
			'/poker/img/cards/D4.png',
			'/poker/img/cards/D5.png',
			'/poker/img/cards/D6.png',
			'/poker/img/cards/D7.png',
			'/poker/img/cards/D8.png',
			'/poker/img/cards/D9.png',
			'/poker/img/cards/D10.png',
			'/poker/img/cards/D11.png',
			'/poker/img/cards/D12.png',
			'/poker/img/cards/D13.png',
			'/poker/img/cards/H1.png',
			'/poker/img/cards/H2.png',
			'/poker/img/cards/H3.png',
			'/poker/img/cards/H4.png',
			'/poker/img/cards/H5.png',
			'/poker/img/cards/H6.png',
			'/poker/img/cards/H7.png',
			'/poker/img/cards/H8.png',
			'/poker/img/cards/H9.png',
			'/poker/img/cards/H10.png',
			'/poker/img/cards/H11.png',
			'/poker/img/cards/H12.png',
			'/poker/img/cards/H13.png'
		];

		this.preloadImageArray(allImages, 0);
	}

	preloadImageArray(imageArray = [], idx = 0) {
		let pre_images = [imageArray.length];

		if (imageArray && imageArray.length > idx) {
			pre_images[idx] = new Image();
			pre_images[idx].onload = () => {
				this.preloadImageArray(imageArray, idx + 1);
			};
			pre_images[idx].src = imageArray[idx];
		}
	}

}

module.exports = Poker;
