module.exports = (app, mod) => {

	let theme = mod?.theme || mod.loadGamePreference('poker-theme') || "flat";

    let backs = mod.loadGamePreference('poker-cards') || mod.card_img;

    let felt = mod.loadGamePreference('poker-felt') || mod.felt;

    let show_player_pot = !mod.loadGamePreference('poker-hide-pot');

	return `
			<fieldset class="saito-grid">
			<legend class="settings-label">Board Display</legend>
			<input type="radio" id="threed" name="board" value="threed" ${ theme == "threed" ? 'checked' : ''}/>
			<label for="threed">3D</label>
			<input type="radio" id="flat" name="board" value="flat" ${ theme == "flat" ? 'checked' : ''}/>
			<label for="flat">Flat</label>
			</fieldset>

			<fieldset class="saito-grid">
			<legend class="settings-label">Card Backs</legend>
            <input type="radio" id="newdefault" name="card_backs" value="new_red" ${backs == "new_red" ? "checked" : ""}/>
            <label for="newdefault">Saito Gears</label>
            <input type="radio" id="classic" name="card_backs" value="red_back" ${backs == "red_back" ? "checked" : ""}/>
            <label for="classic">Classic Saito</label>
            <input type="radio" id="blue" name="card_backs" value="new_blue" ${backs == "new_blue" ? "checked" : ""}/>
            <label for="blue">Cool Blue</label>
			</fieldset>
			
			<fieldset class="saito-grid">
			<legend class="settings-label">Table Top</legend>
            <input type="radio" id="green" name="table_felt" value="green" ${felt == "green" ? "checked" : ""}/>
            <label for="green">Standard</label>
            <input type="radio" id="warm" name="table_felt" value="red" ${felt == "red" ? "checked" : ""}/>
            <label for="warm">Warmer</label>
            <input type="radio" id="cool" name="table_felt" value="blue" ${felt == "blue" ? "checked" : ""}/>
            <label for="cool">Cooler</label>
			</fieldset>

			<fieldset class="saito-grid">
			<legend class="settings-label">Game Options</legend>
				<input type="checkbox" id="show-player-pot" ${show_player_pot ? "checked":"" }/>
				<label for="show-player-pot">always show player pot</label>
			</fieldset>
			`;
};
