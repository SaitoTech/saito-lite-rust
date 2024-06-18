const SaitoProgressTemplate = require('./saito-progress-bar.template');

class SaitoProgressBar {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.message = "Loading...";
		this.closeTimer = null;
	}

	show() {
		this.render();
	}
	hide() {
		this.remove(0);
	}

	render(message = "") {
		if (message){
			this.message = message;
		}

		// New message coming in, don't auto close
		if (this.closeTimer){
			clearTimeout(this.closeTimer);
			this.closeTimer = null;
		}

		let myqs = this.container + " #saito-loader-container";
		myqs = myqs.trim();

		if (document.querySelector(myqs)){
			this.app.browser.replaceElementBySelector(SaitoProgressTemplate(this), myqs);
		}else{
			if (this.container){
				this.app.browser.addElementToSelector(
					SaitoProgressTemplate(this),
					this.container
				);
			}else{
				this.app.browser.prependElementToDom(
					SaitoProgressTemplate(this)
				);

			}
		}
	}


	finish(message = "Loaded!"){
		let elem = document.querySelector(`${this.container} #saito-loader-container`);
		if (elem){
			elem.classList.remove("active");
			this.render(message);
			this.remove();
		}
	}

	remove(delay = 1000) {
		this.closeTimer = setTimeout(() => {
			let selector = this.container + ' #saito-loader-container';
			selector = selector.trim();

			if (document.querySelector(selector)) {
				document.querySelector(selector).remove();
			}
		}, delay);
	}
}

module.exports = SaitoProgressBar;
