const { emoji } = require("node-emoji");


class SaitoEmoji {

    constructor(app, mod, input_id, controls_selector = null) {
        this.app = app;
        this.input_id = input_id;
        this.controls_selector = controls_selector;
        this.selector = ".saito-emoji-container";
        this.name = "SaitoEmoji";
        this.mod = mod;
        this.picker_shown = false;
    }

    render() {

	let app = this.app;
	let mod = this.mod;

        if (app.browser.isMobileBrowser(navigator.userAgent)) {
            return;
        }
        let input_element = document.querySelector(`#${this.input_id}`);
        let parentElement = input_element.parentElement;

        // clone input and add to dom with emoji container
        let clone_input_element =  document.querySelector(`#${this.input_id}`).cloneNode(false);
        let div = document.createElement('div')
        div.className = "saito-emoji-container"
        div.appendChild(clone_input_element);
        input_element.insertAdjacentElement('afterend', div);

        // remove original input
        parentElement.removeChild(document.querySelector(`#${this.input_id}`));

        // get this parent element
        let input = document.querySelector(`#${this.input_id}`);
        this.parentElement = input.parentElement;

        let controls_element = document.querySelector(this.controls_selector);

        if (controls_element) {
            app.browser.addElementToElement(`<div class="saito-emoji"> <i class="fas fa-smile"></i></div>`, controls_element);
        } else {
            app.browser.addElementToElement(`<div class="saito-emoji"> <i class="fas fa-smile"></i></div>`, this.parentElement);
        }
        this.attachEvents(app, mod)
    }


    attachEvents() {

	let app = this.app;
	let mod = this.mod;

        let self = this;
        let emoji_icon = {};
        let controls_element = document.querySelector(this.controls_selector);
        if (controls_element) {
            emoji_icon = controls_element.querySelector('.saito-emoji');
        } else {
            emoji_icon = document.getElementById(this.input_id).parentElement.querySelector('.saito-emoji');
        }
        
        emoji_icon.onclick = (e) => {
            if (this.picker_shown === false) {
                this.showPicker()
            } else {
                this.removePicker();
            }

            if (this.picker_shown) {
                document.querySelector('emoji-picker').addEventListener('emoji-click', event => {
                    let emoji = event.detail;
                    var input = document.getElementById(this.input_id);
                    if(input.value) {
                        input.value += emoji.unicode;
                    } else {
                        input.textContent += emoji.unicode;
                    }
                });

                // on clicking outside
                document.onclick = (e)=> {
                    let picker =  document.querySelector('emoji-picker');
                    if(picker){
                        let controls_element = document.querySelector(this.controls_selector);
                        if (controls_element) {
                            emoji_icon = controls_element.querySelector('.saito-emoji');
                        } else {
                            emoji_icon = document.getElementById(this.input_id).parentElement.querySelector('.saito-emoji');
                        }
                        if(e.target != emoji_icon && !emoji_icon.contains(e.target) && !picker.contains(e.target) ){
                            self.removePicker();
                        }
                    }
                    

                }
            }

        }

   


    }

    showPicker(){
        this.app.browser.addElementToElement(`<emoji-picker></emoji-picker>`, this.parentElement);
        if(document.querySelector('emoji-picker')) {
          this.picker_shown = true;
        }
    }

    removePicker() {
        if(document.querySelector('emoji-picker')) {
            document.querySelector('emoji-picker').parentElement.removeChild(document.querySelector('emoji-picker'));
            this.picker_shown = false
        }
    }

}

module.exports = SaitoEmoji;
