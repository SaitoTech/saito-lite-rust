module.exports  = (placeholder = "") => {
	let html = `
	<div class="saito-input">
		<div id="text-input" class="text-input hide-scrollbar" type="text" value="" autocomplete="off" placeholder="${placeholder}" contenteditable="true"></div>
		<i class="saito-emoji fa-regular fa-face-smile"></i>
	</div>
	`;

	return html;
};
