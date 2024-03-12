module.exports = SaitoInputTemplate = (num, placeholder) => {
	let html = `
	<div class="saito-input">
		<textarea id="text-input" class="text-input hide-scrollbar" type="text" 
		value="" autocomplete="off" placeholder="${placeholder}"></textarea>
		<i class="saito-emoji fa-regular fa-face-smile"></i>
	</div>
	`;

	return html;
};
