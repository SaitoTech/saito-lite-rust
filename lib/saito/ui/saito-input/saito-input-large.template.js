const SaitoInputControls = require("./saito-input-controls.template");

module.exports = SaitoInputLargeTemplate = (placeholder) => {
	let html = `
	<div class="saito-input saito-input-large">
		<textarea rows="7" class="post-tweet-textarea text-input" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="${placeholder}" cols="60"></textarea>

		${SaitoInputControls()}

	</div>
	`;


	return html;
}