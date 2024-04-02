class HealthMeter {
	constructor(app, mod, container = "") {
		this.app = app;
		this.mod = mod;
		this.container = container;

		this.ordinal = 0;

		this.multiple = 100;

	}

	template(id){
		return `<div id="${id}" class="health-meter"></div>`;

	}

	render(health = 0) {
		health = parseInt(health);
		if (this.ordinal == 0) {
			let max = 0;
			Array.from(document.querySelectorAll('.health-meter')).forEach(
				(ov) => {
					let temp = parseInt(ov.id.replace('health-meter-', ''));
					if (temp > max) {
						max = temp;
					}
				}
			);

			this.ordinal = max + 1;
		}

		let id = "health-meter-"+this.ordinal;

		if (document.getElementById(id)){
			this.app.browser.replaceElementById(this.template(id), id);
		}else{
			this.app.browser.addElementToSelectorOrDom(this.template(id), this.container);
		}

		let superlative = Math.floor(health / this.multiple);

		if (superlative){
			for (let j = 0; j < superlative; j++){
				this.addHealthMeter(this.multiple);
			}
		}
		health -= superlative*this.multiple;

		this.addHealthMeter(health);
	
	}

	attachEvents(){}

	addHealthMeter(health){

		//let opacity = Math.floor(255/this.divisor);
		//opacity = opacity.toString(16);

		let height = Math.round(100*health/this.multiple);
		let border = (height > 0 && height < 100) ? "border-top: 1px solid;" : "";
		let html = `<div class="health-meter-health" style="background:${this.color}99; height:${height}%;${border}"></div>`;

		this.app.browser.addElementToId(html, "health-meter-"+this.ordinal);

	}

}




module.exports = HealthMeter;
