const SaitoInputControls = require("./saito-input-controls.template");

module.exports = SaitoInputLargeTemplate = (placeholder) => {
	let html = `
	<div class="saito-input saito-input-large">
		<textarea class="post-tweet-textarea text-input" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="${placeholder}"></textarea>

		${SaitoInputControls()}

	</div>
	`;


	return html;
}