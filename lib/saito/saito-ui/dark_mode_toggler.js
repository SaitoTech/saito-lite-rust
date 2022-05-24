
const ModTemplate = require("../../templates/modtemplate");

class Toggler {

    constructor(app) {
      
        this.app = this;

        this.themes = {
            light: {
                "--saito-font": "visuelt-light",
                "--saito-background": "white",
                "--saito-primary": "#f71f3d",
                "--saito-secondary": "#ff8235",
                "--saito-tetiary": "rgb(234, 234, 239)",
                "--saito-blue": "#35b2ff",
                "--saito-default-font": "#555",
                "--saito-paper": "#f2f0f0",
                "--saito-white": "#f9f2f2",
                "--saito-black": "#1c1c23",
                "--saito-black-faded": "#1c1c23b5",

                "--saito-header-height": "92.2344px",
                "--saito-menu-background": "white",
                "--saito-profile-background": "white",
                "--saito-border": "#a5a5a5bb",
                "--saito-chat-background": "white"

            },
            dark: {
                "--saito-font": "visuelt-light",
                "--saito-background": "#333",
                "--saito-primary": "#f71f3d",
                "--saito-secondary": "#ff8235",
                "--saito-tetiary": "rgb(234, 234, 239)",
                "--saito-blue": "#3c6177",
                "--saito-default-font": "#d2d2d2",
                "--saito-paper": "#1c1c236b",
                "--saito-white": "#ffffff",
                "--saito-black": "#1c1c23",
                "--saito-black-faded": "#1c1c23b5",

                "--saito-header-height": " 92.2344px",
                "--saito-menu-background": "#212529",
                "--saito-profile-background": "#1c1c23",
                "--saito-border": "#555",
                "--saito-chat-background": "rgb(33, 37, 41)"
            },
        };
    }

    initialize() {
        // set darkmode from local storage
        if (localStorage.getItem('darkMode') == 'true') {
            console.log(localStorage.getItem('darkMode'))
            this.darkMode = true;
            console.log('dark')
            for (let i in this.themes.dark) {
                document.querySelector(':root').style.setProperty(i, this.themes.dark[i]);
            }
        } else {
            this.darkMode = false;
            for (let i in this.themes.light) {
                document.querySelector(':root').style.setProperty(i, this.themes.light[i]);
            }
        }
    }

    toggle() {
        console.log('toggling dark mode');

        if (this.darkMode === false) {
            for (let i in this.themes.dark) {
                document.querySelector(':root').style.setProperty(i, this.themes.dark[i]);
            }
        } else {
            for (let i in this.themes.light) {
                document.querySelector(':root').style.setProperty(i, this.themes.light[i]);
            }
        }
        this.darkMode = !this.darkMode;

        localStorage.setItem('darkMode', this.darkMode)

        // this.rerender(this.app);

    }





}

module.exports = Toggler;