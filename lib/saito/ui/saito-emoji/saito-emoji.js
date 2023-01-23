class SaitoEmoji {
    constructor(app, mod, input_id) {
        this.app = app;
        this.mod = mod;
        this.input_id = input_id
        this.selector = ".saito-emoji-container";
        this.name = "SaitoEmoji";
        this.picker_shown = false;
    }

    render() {
        if(this.app.browser.isMobileBrowser(navigator.userAgent)) {
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
        let input = document.querySelector(`.saito-emoji-container > #${this.input_id}`);
        this.parentElement = input.parentElement;

        this.app.browser.addElementToElement(`<div class="saito-emoji"> <i class="fa-solid fa-face-smile"></i> </div>`, this.parentElement);
        this.attachEvents()
    }


    attachEvents() {
        let self = this
        let emoji_icon = document.querySelector(`#${this.input_id} ~ .saito-emoji`);
        emoji_icon.onclick = (e) => {
            if (this.picker_shown === false) {
                console.log("showing picker");

                this.showPicker()
            } else {
                this.removePicker();
            }

            if (this.picker_shown) {
                document.querySelector('emoji-picker').addEventListener('emoji-click', event => {
                    let emoji = event.detail;
                    var input = document.getElementById(this.input_id);
                    input.value += emoji.unicode

                });

                // on clicking outside
                document.onclick = (e)=> {
                    let picker =  document.querySelector('emoji-picker');
                    if(picker){
                        let emoji_icon = document.querySelector(`#${this.input_id} ~ .saito-emoji`).firstElementChild;
                        console.log(e.target, emoji_icon)
                        if(e.target != emoji_icon && !picker.contains(e.target) ){
                            self.removePicker();
                        }
                    }
                    

                }
            }

        }

   


    }

    showPicker(){
        console.log("inside show picker");
        this.app.browser.addElementToElement(`<emoji-picker></emoji-picker>`, this.parentElement);
        this.picker_shown = true;
    }

    removePicker() {
        document.querySelector('emoji-picker').parentElement.removeChild(document.querySelector('emoji-picker'));
        this.picker_shown = false
    }

}

module.exports = SaitoEmoji;
