const MainTemplate = require('./main.template');

class Main {
        constructor(app, mod, container="") {
                this.app = app;
                this.mod = mod;
                this.container = '.saito-container';
                this.app.connection.on('saito-atr-render-request', (obj) => {
                	console.log("rendering atr ");
			this.render();
		});
        }

        render(){
        	document.querySelector('.saito-container').innerHTML = MainTemplate(this.app, this.mod);

		this.attachEvents();
        }

        attachEvents() {

        }
}

module.exports = Main;

