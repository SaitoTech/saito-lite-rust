module.exports = JoinLeagueTemplate = (app, mod, tooltip_self) => {

	let html = `
		<div class="saito-tooltip" id="saito-tooltip-${tooltip_self.ordinal}">
			<i class="fa-solid fa-circle-info saito-tooltip-icon"></i>
			
			<div class="saito-tooltip-info tooltip-info-hide" id="saito-tooltip-info-${tooltip_self.ordinal}">
				${tooltip_self.info}
			</div>

		</div>
	`;

 
   	return html;
};
