const SaitoProgressTemplate = require('./saito-progress-bar.template');

class SaitoProgressBar {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.message = "Loading...";
	}

	show() {
		this.render();
	}
	hide() {
		this.remove();
	}

	render(message = "") {
		if (message){
			this.message = message;
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
			this.render(message);
			elem.classList.remove("active");
			this.remove(800);
		}
	}

	remove(delay = 500) {
		setTimeout(() => {
			let selector = this.container + ' #saito-loader-container';
			selector = selector.trim();

			if (document.querySelector(selector)) {
				document.querySelector(selector).remove();
			}
		}, delay);
	}
}

module.exports = SaitoProgressBar;
