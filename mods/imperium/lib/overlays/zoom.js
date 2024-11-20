const ZoomTemplate = require('./zoom.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ZoomOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
	}

	render(sector="") {

		this.visible = true;
		this.overlay.show(ZoomTemplate());

		let dw = document.querySelector('.zoom-overlay');
		let gb = document.querySelector('.gameboard');
		let gb2 = gb.cloneNode(true);
		gb2.removeAttribute('id');
		gb2.removeAttribute('style');
		gb2.classList.add('gameboard-clone');

		dw.appendChild(gb2);

		let obj = document.querySelector('.gameboard-clone');
		obj.style.position = '';
		obj.style.transformOrigin = '';
		obj.style.transform = '';
		obj.style.top = '0px !important';
		obj.style.bottom = '';
		obj.style.left = '0px !important';
		obj.style.right = '';

		$('.gameboard-clone').draggable({});

		this.attachEvents(sector);
	}

	attachEvents() {

                let imperium_self = this.mod;

		for (let sector in this.mod.game.board) {

	                let qs = `.gameboard-clone .sector_${sector}`;
	                let sys = imperium_self.returnSectorAndPlanets(sector);

	                console.log('attach events...');
	                console.log('testing: ' + qs);
	                console.log('to sector: ' + sector);

	                let xpos = 0;
	                let ypos = 0;

	                try {
	                        $(qs).off();
                
	                        $(qs) 
	                                .on('mouseenter', function () {
	                                        let pid = $(this).attr('id');
	                                        imperium_self.addSectorHighlight(pid, 1);
	                                })
	                                .on('mouseleave', function () {
	                                        let pid = $(this).attr('id');
	                                        imperium_self.removeSectorHighlight(pid, 1);
	                                });
                        
	                        $(qs).on('mousedown', function (e) {
	                                xpos = e.clientX;
	                                ypos = e.clientY;
	                        });

	                        $(qs).on('mouseup', function (e) {
	                                if (Math.abs(xpos - e.clientX) > 4) {
	                                        return;
	                                }
	                                if (Math.abs(ypos - e.clientY) > 4) {
	                                        return;
	                                }

	                                imperium_self.sector_overlay.render(sector);

	                        });
	                } catch (err) { 
	                        console.log('error attaching events to sector...');
	                }
		}

	}

}

module.exports = ZoomOverlay;
