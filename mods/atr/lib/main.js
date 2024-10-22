const MainTemplate = require('./main.template');

class Main {
        constructor(app, mod, container="") {
                this.app = app;
                this.mod = mod;
                this.container = '.saito-container';
        }

        render(){
        	if (document.querySelector('.saito-container')) {
			this.app.browser.replaceElementBySelector(
				MainTemplate(this.app, this.mod),
				'.saito-container'
			);
		} else {
			this.app.browser.addElementToSelector(
				MainTemplate(this.app, this.mod),
				this.container
			);
		}

		this.attachEvents();
        }

        attachEvents() {

        }
}

module.exports = Main;

