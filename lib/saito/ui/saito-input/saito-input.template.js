module.exports = SaitoInputTemplate = (num) => {
	let html = `
	<div id="saito-input${num}" class="saito-input">
		<div id="text-input" class="text-input hide-scrollbar" type="text" value="" autocomplete="off" placeholder="Type something..." contenteditable="true"></div>
		<i class="saito-emoji fas fa-smile"></i>
	</div>
	`;


	return html;
}