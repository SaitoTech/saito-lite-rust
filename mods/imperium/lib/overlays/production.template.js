module.exports  = (
	imperium_self,
	resources_available,
	production_limit,
	cost_limit = 0,
	available_units
) => {
	let cost_limit_desc = '';
	if (cost_limit > 0) {
		cost_limit_desc =
			'You may spend a maximum of ' + cost_limit + ' resources. ';
	}

	let html = '';
	html += `

<div class="production-overlay" style="">
  <div class="production-info">
    <div class="production-header">
      <div class="production-description">
	Available: <span class="resources_box available">4 resources</span><br>
	Required: <span class="resources_box required">0 resources</span>
      </div>
      <div class="production-button saito-button-secondary">CONTINUE</div>
    </div>
    <div class="production-table">
  `;

	for (let i = 0; i < available_units.length; i++) {
		let preobj = imperium_self.units[available_units[i]];
		let obj = JSON.parse(JSON.stringify(preobj));
		obj.owner = imperium_self.game.player;
		obj = imperium_self.upgradeUnit(obj, imperium_self.game.player);
		html += preobj.returnCardImage(obj, 'square');
	}

	html += `
    </div>
  </div>
</div>
  `;

	return html;
};
