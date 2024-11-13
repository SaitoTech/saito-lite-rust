const SaitoInputControls = require('./saito-input-controls.template');

module.exports  = (input_self, placeholder = "") => {
	let html = `
	<div class="saito-input saito-input-large">
		<textarea class="post-tweet-textarea text-input" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="${placeholder}" rows="7" cols="60"></textarea>
		<div class="saito-mentions-list hidden" id="saito-mentions-list"></div>
		<!--div id="post-tweet-textarea" class="text-input post-tweet-textarea" type="text" value="" autocomplete="off" placeholder="${placeholder}" contenteditable="true" rows="7" cols="60"></div-->
		${SaitoInputControls(input_self)}

	</div>
	`;

	return html;
};
