const saito = require('./../../../lib/saito/saito');
const ControlsTemplate = require('./controls.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class QuakeControls {
	constructor(app, mod, tx) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app);
		this.current_setting = '';
		//this.controls = {};
		this.default_config = {
			'+attack': ['MOUSE1', 'bind MOUSE1 +attack'],
			'+zoom': ['MOUSE2', 'bind MOUSE2 +zoom'],
			'+forward': ['w', 'bind w +forward'],
			'+back': ['s', 'bind s +back'],
			'+moveleft': ['a', 'bind a +moveleft'],
			'+moveright': ['d', 'bind d +moveright'],
			'+moveup': ['SPACE', 'bind SPACE +moveup'],
			'+speed': ['SHIFT', 'bind SHIFT +speed'],
			'+movedown': ['CTRL', 'bind CTRL +movedown'],
			weapnext: ['MWHEELDOWN', 'bind MWHEELDOWN weapnext'],
			weapprev: ['MWHEELDOWN', 'bind MWHEELUP weapprev'],
			'weapon 1': ['1', 'bind 1 weapon 1'],
			'weapon 2': ['2', 'bind 2 weapon 2'],
			'weapon 3': ['3', 'bind 3 weapon 3'],
			'weapon 4': ['4', 'bind 4 weapon 4'],
			'weapon 5': ['5', 'bind 5 weapon 5'],
			'weapon 6': ['6', 'bind 6 weapon 6'],
			'weapon 7': ['7', 'bind 7 weapon 7'],
			'weapon 8': ['8', 'bind 8 weapon 8'],
			'weapon 9': ['9', 'bind 9 weapon 9'],
			messagemode: ['t', 'bind t messagemode'],
			messagemode2: ['y', 'bind y messagemode2'],
			'+scores': ['TAB', 'bind TAB +scores'],
			togglemenu: ['ESCAPE', 'bind ESCAPE togglemenu'],
			screenshot: ['p', 'bind p screenshot'],
			sensitivity: [5, 'sensitivity 5'],
			cg_fov: [90, 'cg_fov 90'],
			s_volume: [0.23, 's_volume 0.23']
		};
		this.controls = {};
		this.loadSavedControls();
	}

	render() {
		let app = this.app;
		let mod = this.mod;
		this.overlay.show(ControlsTemplate(app, mod, this));
		this.attachEvents();
		//    this.loadSavedControls();
		// render menu with saved or default config
		this.fill_menu();
	}

	attachEvents() {
		let app = this.app;
		let mod = this.mod;

		let thisobj = this;

		document.querySelectorAll('.quake-control-trigger').forEach((el) => {
			el.onclick = (e) => {
				document.getElementById('cover-indicator').innerHTML =
					e.currentTarget.children[0].innerHTML;
				document.getElementById('screen-cover').style.zIndex = 100;

				let setting = e.currentTarget.getAttribute('id');
				//console.log("setting: " + setting);
				thisobj.current_setting = setting;

				thisobj.handleKey = function (e) {
					return thisobj.handleInput(e.key);
				};
				thisobj.handleMouse = function (e) {
					return thisobj.handleInput(e.button);
				};
				thisobj.handleWheel = function (e) {
					scroll = -5 * Math.sign(e.deltaY);
					return thisobj.handleInput(scroll);
				};

				// keyboard buttons
				window.addEventListener('keydown', thisobj.handleKey);
				// mouse buttons
				window.addEventListener('mousedown', thisobj.handleMouse);
				// scroll wheel
				window.addEventListener('wheel', thisobj.handleWheel);

				////
			};
		});

		// reset defaults
		let defaultButton = document.getElementById('default-controls-button');

		defaultButton.addEventListener('click', () => {
			console.log('restore default clicked');
			thisobj.defaults();
		});

		let finishButton = document.getElementById('finish-controls-button');

		finishButton.addEventListener('click', () => {
			console.log('clicked button \'finish\' button');
			this.overlay.remove();
			this.applyControls();
			this.writeControls();
			this.saveSettings();
		});

		//////////////////////////////////////////////////////////////////////////////////////////
		// slider / feild sync EVENTs

		let sens_slider = document.getElementById('sensitivity');
		let sens_indicator = document.getElementById('sensitivity_indicator');

		sens_slider.oninput = function () {
			let v = sens_slider.value;
			thisobj.updateControls(['sensitivity'], [v, 'sensitivity ' + v]);
			sens_indicator.value = v;
			thisobj.saveSettings();
		};

		sens_indicator.oninput = function () {
			var v = sens_indicator.value;
			thisobj.updateControls(['sensitivity'], [v, 'sensitivity ' + v]);
			sens_slider.value = v;
			thisobj.saveSettings();
		};

		let fov_slider = document.getElementById('cg_fov');
		let fov_indicator = document.getElementById('fov_indicator');

		fov_slider.oninput = function () {
			var v = fov_slider.value;
			thisobj.updateControls(['cg_fov'], [v, 'cg_fov ' + v]);
			fov_indicator.value = v;
			thisobj.saveSettings();
		};

		fov_indicator.oninput = function () {
			var v = fov_indicator.value;
			thisobj.updateControls(['cg_fov'], [v, 'cg_fov ' + v]);
			fov_slider.value = v;
			thisobj.saveSettings();
		};
		///////////////////////////////////////////////////////////////////////////////////////

		// End of attachEvents() object
	}

	defaults() {
		this.controls = structuredClone(this.default_config);
		this.fill_menu();
	}

	// useful to update this.controls from within function
	updateControls(key, value) {
		this.controls[key] = value;
	}

	// Apply menu controls in game
	// first write a config file, then exec console command to run file in game
	applyControls() {
		function type(key) {
			document.dispatchEvent(
				new KeyboardEvent('keydown', {
					keyCode: key
				})
			);
		}

		// `exec sqc` into game console
		// will fail if game console already open
		type(192); // ~
		type(191); // /
		type(69); // e
		type(88); // x
		type(69); // e
		type(67); // c
		type(32); //
		type(83); // s
		type(81); // q
		type(67); // c
		type(13); // [enter]
		type(192); // ~
	}

	writeControls() {
		// must be single quotes to escape implicit double quotes
		// from this.controls values
		let cfg_file = '';

		for (const [object, key] of Object.entries(this.controls)) {
			cfg_file = cfg_file.concat(key[1] + ';');
		}
		FS.writeFile('base/baseq3/sqc.cfg', cfg_file);
	}

	loadSavedControls() {
		this.mod.load();
		// if no saved controls
		if (!this.mod.quake3) {
			this.controls = { ...this.default_config };
		} else {
			this.controls = { ...this.mod.quake3['controls'] };
		}
	}

	fill_menu() {
		console.log('in fill_menu()');
		console.log(this.controls);
		for (const [key, value] of Object.entries(this.controls)) {
			var elem = document.getElementById(key);
			// for keybinds

			// DON'T ALLOW THIS TO PASS - doesn't work for some reason
			// if you actually allow this block to run
			// UI disallows key inputs to pass behind menu thus breaking applyControls()
			// only works if you just let the error ride - no idea why
			if (elem === null && false) {
				continue;
			} else if (elem.tagName == 'TR') {
				elem.children[1].innerHTML = value[0];
			}
			// for sliders
			else {
				let s_elem = document.getElementsByClassName(key);
				s_elem[0].value = value[0];
				s_elem[1].value = value[0];
			}
		}
		console.log('end of fill_menu()');
	}

	saveSettings() {
		if (!this.mod.quake3) {
			this.mod.quake3 = {};
		}
		this.mod.quake3['controls'] = this.controls;
		this.mod.save();
	}

	handleInput(input) {
		document.getElementById('screen-cover').style.zIndex = -100;

		q3_bind = this.toQuakeBind(input);

		// remove event listeners
		window.removeEventListener('keydown', this.handleKey);
		window.removeEventListener('mousedown', this.handleMouse);
		window.removeEventListener('wheel', this.handleWheel);

		// full
		q3_bindCommand = 'bind ' + q3_bind + ' "' + this.current_setting + '"';

		// update JSON game config
		// {setting: [value, command]}
		this.controls[this.current_setting] = [q3_bind, q3_bindCommand];

		// update HTML table to reflect current settings
		// if that element exists
		let tag = document.getElementById(this.current_setting);
		if (tag != null) {
			tag.children[1].innerHTML = q3_bind;
		} else {
			console.log('tag is null: ' + this.current_setting);
		}
		this.saveSettings();
	}

	toQuakeBind(input) {
		if (typeof input == 'number') {
			switch (input) {
			case 0:
				return 'MOUSE1';
			case 2:
				return 'MOUSE2';
			case 1:
				return 'MOUSE3';
			case 4:
				return 'MOUSE4';
			case 3:
				return 'MOUSE5';
			case 5:
				return 'MWHEELUP';
			case -5:
				return 'MWHEELDOWN';
			}
		} else if (input == ' ') {
			return 'SPACE';
		}
		// just return the key
		else if (input.length == 1) {
			return input;
		}
		// return special keys
		else if (input.length > 1) {
			switch (input) {
			case 'Shift':
				return 'SHIFT';
			case 'Control':
				return 'CTRL';
			case 'Alt':
				return 'ALT';
			case 'Backspace':
				return 'BACKSPACE';
			case 'ArrowUp':
				return 'UPARROW';
			case 'ArrowDown':
				return 'DOWNARROW';
			case 'ArrowLeft':
				return 'LEFTARROW';
			case 'ArrowRight':
				return 'RIGHTARROW';
			case 'Tab':
				return 'TAB';
			case 'Escape':
				return 'ESCAPE';
			case 'Enter':
				return 'ENTER';
			default:
				return 'bad input';
			}
		}
	}
}

module.exports = QuakeControls;
