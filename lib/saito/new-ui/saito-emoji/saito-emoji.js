




class SaitoEmoji {
    constructor(app, mod, input_id) {
        this.app = app;
        this.input_id = input_id
        this.selector = ".saito-emoji-container";
        this.name = "SaitoEmoji";
        this.mod = mod;
        this.picker_shown = false;
    }

    render(app, mod) {
        console.log("adding element to selector");
        console.log('parent selector id', document.querySelector(`#${this.input_id}`).parentElement)
        this.parentElement = document.querySelector(`#${this.input_id}`).parentElement;
        app.browser.addElementToElement(`<div class="saito-emoji"> <i class="fa-solid fa-face-smile"></i> </div>`, this.parentElement);
        this.attachEvents(app, mod)
    }


    attachEvents(app, mod) {
        let self = this
        let emoji_icon = document.querySelector(`#${this.input_id} ~ .saito-emoji`);
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
        this.app.browser.addElementToElement(`<emoji-picker></emoji-picker>`, this.parentElement);
        this.picker_shown = true;
    }

    removePicker() {
        document.querySelector('emoji-picker').parentElement.removeChild(document.querySelector('emoji-picker'));
        this.picker_shown = false
    }

}

module.exports = SaitoEmoji;
