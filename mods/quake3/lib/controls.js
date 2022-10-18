const saito = require("./../../../lib/saito/saito");
const ControlsTemplate = require("./controls.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class QuakeControls {

  constructor(app, mod, tx) {
    this.overlay = new SaitoOverlay(app);
    this.controls = this.returnDefaultControls();
    this.current_setting = "";
  }

  render(app, mod) {
    this.overlay.show(app, mod, ControlsTemplate(app, mod, this));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

  }

  returnDefaultControls() {
    return {};
  }


  setMyKeyDownListener(setting) {

    this.current_setting = setting;

    // keyboard buttons
    window.addEventListener("keydown", handleKey);
    
    // mouse buttons    
    window.addEventListener('mousedown', handleMouse);
    
    // scroll wheel
    window.addEventListener('wheel', handleWheel);

  }

  handleKey(event) {
    return handleInput(event.key);
  }

  handleMouse(event) {
    return handleInput(event.button);
  }

  handleWheel(event) {
    scroll = (-5) * Math.sign(event.deltaY);
    return handleInput(scroll);
  }

  handleInput(input) {

    q3_bind = this.toQuakeBind(input);
    
    // remove event listeners
    window.removeEventListener("keydown", handleKey);
    window.removeEventListener("mousedown", handleMouse);
    window.removeEventListener('wheel', handleWheel);
    
    // full
    q3_bindCommand = 'bind ' + q3_bind + ' "' + this.current_setting + '"';
    
    // update JSON game config
    // {setting: [value, command]}
    this.controls[this.current_setting] = [q3_bind, q3_bindCommand];
    
    // update HTML table to reflect current settings
    document.getElementById(this.current_setting).children[1].innerHTML = q3_bind
      
    console.log(this.controls)
    console.log(q3_bindCommand);
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

