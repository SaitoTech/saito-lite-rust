const saito = require("./../../../lib/saito/saito");
const ControlsTemplate = require("./controls.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class QuakeControls {

 constructor(app, mod, tx) {
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
    this.current_setting = "";
    this.controls = {};
    this.default_config = {
    "+attack":      ["MOUSE1", 'bind MOUSE1 +attack'],
    "+zoom":        ["MOUSE2", 'bind MOUSE2 +zoom'],
    "+forward":     ["w", 'bind w +forward'],
    "+back":        ["s", 'bind s +back'],
    "+moveleft":    ["a", 'bind a +moveleft'],
    "+moveright":   ["d", 'bind d +moveright'],
    "+moveup":      ["SPACE", 'bind SPACE +moveup'],
    "+speed":       ["SHIFT", 'bind SHIFT +speed'],
    "+movedown":    ["CTRL", 'bind CTRL +movedown'],
    "weapnext":     ["MWHEELDOWN", 'bind MWHEELDOWN weapnext'],
    "weapprev":     ["MWHEELDOWN", 'bind MWHEELUP weapprev'],
    "weapon 1":     ["1", 'bind 1 weapon 1'],
    "weapon 2":     ["2", 'bind 2 weapon 2'],
    "weapon 3":     ["3", 'bind 3 weapon 3'],
    "weapon 4":     ["4", 'bind 4 weapon 4'],
    "weapon 5":     ["5", 'bind 5 weapon 5'],
    "weapon 6":     ["6", 'bind 6 weapon 6'],
    "weapon 7":     ["7", 'bind 7 weapon 7'],
    "weapon 8":     ["8", 'bind 8 weapon 8'],
    "weapon 9":     ["9", 'bind 9 weapon 9'],
    "messagemode":  ["t", 'bind t messagemode'],
    "messagemode2": ["y", 'bind y messagemode2'],
    "+scores":      ["TAB", 'bind TAB +scores'],
    "togglemenu":   ["ESCAPE", 'bind ESC togglemenu'],
    "screenshot":   ["p", 'bind p screenshot'],
    "sensitivity":  [5, 'sensitivity 5'],
    "cg_fov":       [90, 'cg_fov 90'],
    "s_volume":     [0.23, 's_volume 0.23'],
    }

    
     // defined after defaults in case default_config is needed
     this.loadSavedControls();
  }

  render(app, mod) {
    this.overlay.show(app, mod, ControlsTemplate(app, mod, this));
    this.attachEvents(app, mod);
    // render menu with saved or default config
    this.fill_menu()
  }

  attachEvents(app, mod) {

    let thisobj = this;

    document.querySelectorAll(".quake-control-trigger").forEach((el) => {
      el.onclick = (e) => {
        let setting = e.currentTarget.getAttribute("data-id");
	//console.log("setting: " + setting);
        thisobj.current_setting = setting;

	thisobj.handleKey = function(e) {
          return thisobj.handleInput(e.key);
        }
	thisobj.handleMouse = function(e) {
          return thisobj.handleInput(e.button);
        }
	thisobj.handleWheel = function(e) {
    	  scroll = (-5) * Math.sign(e.deltaY);
    	  return thisobj.handleInput(scroll);
        }

        // keyboard buttons
        window.addEventListener("keydown", thisobj.handleKey);
        // mouse buttons
	window.addEventListener('mousedown', thisobj.handleMouse);
        // scroll wheel
        window.addEventListener('wheel', thisobj.handleWheel);

      }
    });

    let finishButton = document.getElementById("finish-controls-button");

    finishButton.addEventListener("click", () => {
	console.log("clicked button 'finish' button");
	this.overlay.remove();
	this.applyControls();
    });
  }

  applyControls() {
      function type(key) {
	  document.dispatchEvent(new KeyboardEvent("keydown",{
	      keyCode: key
	  }))
      }
      // must be single quotes to escape implicit double quotes
      // from this.controls values
      let cfg_file = '';

      for (const [object, key] of Object.entries(this.controls)) {
	  cfg_file = cfg_file.concat(key[1] + ';')
      }

      FS.writeFile('base/baseq3/sqc.cfg', cfg_file);
      // `exec sqc` into game console
      type(192) // ~
      type(191) // /
      type(69)  // e
      type(88)  // x
      type(69)  // e
      type(67)  // c
      type(32)  // 
      type(83)  // s
      type(81)  // q
      type(67)  // c
      type(13)  // [enter]
      type(192) // ~
  }

  loadSavedControls() {
      this.mod.load();
      // if no saved controls
      if (!this.mod.quake3) {
	  console.log("No config found/loaded. Loading default q3 configuration.")
	  console.log("default_config: " + this.default_config);
	  this.controls = {...this.default_config};
      }
      else {
	  console.log("Loading saved q3 config: ");
	  this.controls = {...this.mod.quake3['controls']};

      }
      console.log(this.controls);
      //this.fill_menu(this.controls);
  }

  fill_menu() {
    console.log("in fill_menu()");
    console.log(this.controls);
    for (const [key, value] of Object.entries(this.controls)) {
	var elem = document.getElementById(key);
	
	// for keybinds
	if (elem.tagName == "TR") {
	    elem.children[1].innerHTML = value[0];
	}
	// for sliders
	else {
	    console.log("else");
	    elem.value = value[0];
	     }
    }
  }
/****
  handleKey(event) {
    return this.handleInput(event.key);
  }

  handleMouse(event) {
    return this.handleInput(event.button);
  }

  handleWheel(event) {
    scroll = (-5) * Math.sign(event.deltaY);
    return this.handleInput(scroll);
  }
****/

  handleInput(input) {

    q3_bind = this.toQuakeBind(input);
    
    // remove event listeners
    window.removeEventListener("keydown", this.handleKey);
    window.removeEventListener("mousedown", this.handleMouse);
    window.removeEventListener('wheel', this.handleWheel);
    
    // full
    q3_bindCommand = 'bind ' + q3_bind + ' \"' + this.current_setting + '\"';
    
    // update JSON game config
    // {setting: [value, command]}
    this.controls[this.current_setting] = [q3_bind, q3_bindCommand];
    
    // update HTML table to reflect current settings
    document.getElementById(this.current_setting).children[1].innerHTML = q3_bind
      
    if (!this.mod.quake3) {
	this.mod.quake3 = {};
}

    this.mod.quake3['controls'] = this.controls
    this.mod.save()

    return q3_bindCommand;

  }

  toQuakeBind(input) {

    if (typeof(input) == 'number') {
        switch(input) {
            case 0:
                return "MOUSE1"
            case 2:
                return "MOUSE2"
            case 1:
                return "MOUSE3"
            case 4:
                return "MOUSE4"
            case 3:
                return "MOUSE5"
            case 5:
                return "MWHEELUP"
            case -5:
                return "MWHEELDOWN"
        }
    }
    else if (input == " ") {
        return "SPACE"
    }
    // just return the key
    else if (input.length == 1) {
        return input;
    }
    // return special keys
    else if (input.length > 1) {
        switch(input) {
            case "Shift":
                return "SHIFT"
            case "Control":
                return "CTRL"
            case "Alt":
                return "ALT"
            case "Backspace":
                return "BACKSPACE"
            case "ArrowUp":
                return "UPARROW"
            case "ArrowDown":
                return "DOWNARROW"
            case "ArrowLeft":
                return "LEFTARROW"
            case "ArrowRight":
                return "RIGHTARROW"
            case "Tab":
                return "TAB"
            case "Escape":
                return "ESCAPE"
            case "Enter":
                return "ENTER"
            default: return "bad input";
        }
    }
  }
}

module.exports = QuakeControls;
