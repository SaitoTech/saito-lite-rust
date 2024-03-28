module.exports = (app, mod) => {
	return `
		<div class="gameboard">
			<div class="logobox">
				<img
					class="hidable"
					src="/beleaguered/img/logo_beleaguered_01.png"
				/>
				<div id="status" class="status"></div>
			</div>
			<div class="rowbox cardstack-container" id="rowbox"></div>
		</div>`;
}