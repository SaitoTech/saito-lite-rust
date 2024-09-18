class SaitoScheduler{
    constructor(app, mod, container) {
        this.app = app;
        this.mod = mod;
        this.items = {};
        this.container = container; 
        this.initialize();
    }

    initialize() {
        let mods = this.app.modules.respondTo('saito-scheduler');
		for (const mod1 of mods) {
			let item = mod1.respondTo('saito-scheduler');
			if (item instanceof Array) {
				item.forEach((a) => {			
                    this.items[a.text] = {
                        icon: a.icon,
                        callback: a.callback
                    };
				});
			}
		}
    }

    render(day, month, year) {

        console.log(day, month, year);
        
        const container = document.querySelector(this.container);
        if (container) {
            container.innerHTML = '';
            Object.keys(this.items).forEach(key => {
                const item = this.items[key];
                const itemElement = document.createElement('button');
                itemElement.innerHTML = `<i class="${item.icon}"></i> ${key}`;  
                itemElement.addEventListener('click', ()=> item.callback(this.app, day, month, year));
                container.appendChild(itemElement);
            });

        } else {
            console.error(`Container with selector ${this.container} not found`);
        }
    }
}

module.exports = SaitoScheduler;
