module.exports = (his_self) => {
	let help = `New World Bonus Phase`;

	let cb = "";

	if (his_self.game.state.new_world_bonus['england'] > 0)    { if (cb != "") { cb += ', '; } cb += `English (${his_self.game.state.new_world_bonus['england']})`; }
	if (his_self.game.state.new_world_bonus['france'] > 0)     { if (cb != "") { cb += ', '; } cb += `French (${his_self.game.state.new_world_bonus['france']})`; }
	if (his_self.game.state.new_world_bonus['ottoman'] > 0)    { if (cb != "") { cb += ', '; } cb += `Tukrs (${his_self.game.state.new_world_bonus['ottoman']})`; }
	if (his_self.game.state.new_world_bonus['hapsburg'] > 0)   { if (cb != "") { cb += ', '; } cb += `Haps (${his_self.game.state.new_world_bonus['hapsburg']})`; }
	if (his_self.game.state.new_world_bonus['papacy'] > 0)     { if (cb != "") { cb += ', '; } cb += `Papacy (${his_self.game.state.new_world_bonus['papacy']})`; }
	if (his_self.game.state.new_world_bonus['protestant'] > 0) { if (cb != "") { cb += ', '; } cb += `Prots (${his_self.game.state.new_world_bonus['protestant']})`; }

	if (cb === "") {
	  cb = "no new world card bonuses this turn...";
	} else {
	  cb = "New World Card Bonuses: " + cb;
	}

	let html = `
      <div class="new-world-overlay" id="new-world-overlay">
	<div class="help">${help}</div>
	<div class="content">
          <div class="conquests">
            <div class="title">conquests</div>
          </div>
          <div class="colonies">
            <div class="title">colonies</div>
          </div>
          <div class="explorations">
            <div class="title">explorations</div>
          </div>
        </div>
	<div class="card_bonuses">${cb}</div>
      </div>
  `;
	return html;
};
