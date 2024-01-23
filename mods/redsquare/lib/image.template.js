module.exports = (app, mod, images) => {
	let imgs = ``;
	let tweet_picture_height = 'unset';
	let multi_max_height = '450px';
	if (images.length > 1) {
		tweet_picture_height = 'unset';
		multi_max_height = '150px';
	}
	if (images.length > 2) {
		multi_max_height = '150px';
	}

	if (images.length > 0) {
		for (let i = 0; i < images.length; i++) {
			imgs += `<div><img class="image-${i}" data-index="${i}" alt="saito dymamic image" src="${images[i]}"></div>`;
		}
	}

	return `<div class="tweet-picture"><div class="saito-img-flex" style="--image-height:${tweet_picture_height};--multi-max-height:${multi_max_height}">${imgs}</div></div>`;
};
