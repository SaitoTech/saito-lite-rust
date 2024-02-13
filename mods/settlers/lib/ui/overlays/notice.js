const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class NoticeOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(this.template());
		this.attachEvents();
	}

	attachEvents() {
		try {
			document.querySelector('.notice_overlay').onclick = () => {
				this.overlay.hide();
			};
			this.overlay.blockClose();

		} catch (err) {
			console.log(err);
		}
	}

	template(){
		return `
		<div class="notice_overlay splash_overlay saitoa">
		<h2>Two Player Settlers Variant</h2>
		<div>If you are familiar with the standard rules of Settlers, there are some changes to the two player version to make game play more fair and fun:</div>
		<ul>
		<li>The longest road requires a minimum of <em>6</em> road segments</li>
		<li>The longest road is worth only <em>1</em> victory point</li>
		<li>The bandit is the famous Robin Hood, who has a sense of justice. If a player is losing by 2 or more points, Robin Hood will come to their aid whenever the 7 is rolled.</li>
		</ul>
		</div>
		`;
	}
}

module.exports = NoticeOverlay;
