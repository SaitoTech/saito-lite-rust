module.exports = (app, mod) => {
	return `
			<div class="main" id="main">
				<div class="board shogun-main">
					<div class="shop"><i class="fa-solid fa-shop"></i></div>
					<div class="active_card_zone" id="active_card_zone"></div>
				</div>
				<div class="purchase_zone"></div>
				<div id="trash_can" class="trash_can"></div>
			</div>
	`;
}