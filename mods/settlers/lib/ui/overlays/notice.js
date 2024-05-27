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
		} catch (err) {
			console.log(err);
		}
	}

	template(){
		return `
		<div class="notice_overlay splash_overlay saitoa">
		<h2>Two Player Settlers Variant</h2>
		<div>If you are familiar with the standard rules of Settlers, here are some changes to the two player version to make gameplay more fair and fun:</div>
		<ul style="margin-left:5rem;margin-right:5rem;">
		<li>longest road requires <em>6</em> road segments</li>
		<li>longest road worth only <em>1</em> victory point</li>
		<li><em>*NEW*</em> largest army worth only <em>1</em> victory point</li>
		<li>if a player is losing by 2 or more points, Robin Hood (the famous bandit) will come to their aid whenever a 7 is rolled.</li>
		</ul>
		</div>
		`;
	}
}

module.exports = NoticeOverlay;
