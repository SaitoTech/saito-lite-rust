module.exports = (app, mod) => {

	let current_source = app.options?.limbo?.advanced;

	let html = `
			<div class="saito-module-settings">
			<fieldset class="saito-grid">
			<legend class="settings-label">Cast Options</legend>
			<input type="radio" id="central" name="limbo-options" value="default" ${current_source ? "" : "checked"}/>
			<label for="central"> Defaults <span class="note">(follow Saito defaults for swarmcasting)</span></label>
			<input type="radio" id="distributed" name="limbo-options" value="advanced" ${current_source ? "checked" :""}/>
			<label for="distributed"> Advanced <span class="note">(show advanced options when starting a swarmcast)</span></label>
			</fieldset>
			`;

	html += "</div>";

	return html;
}
