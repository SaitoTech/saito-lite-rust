const modal_templates = require("../../../mods/ui-elements/templates/modal_templates");

class Toggler extends modal_templates {

    constructor(app) {
        super(app)
        this.app = this;

        this.themes = {
            light: {
                '--saito-background': 'white',
                '--saito-primary': '#f71f3d',
                '--saito-secondary': '#ff8235',
                '--saito-tetiary': 'rgb(234, 234, 239)',
                '--saito-blue': '#35b2ff',
                '--saito-default-font': '#555',
                '--saito-paper': '#f2f0f0',
                '--saito-white': '#f9f2f2',
                '--saito-black': '#1c1c23',
                '--saito-black-faded': '#1c1c23b5',
                '--saito-font': '"Lato", sans-serif',

            },
            dark: {
                '--saito-background': 'rgb(8, 8, 9)',
                '--saito-primary': '#730111',
                '--saito-secondary': '#693e23',
                '--saito-tetiary': 'rgb(234, 234, 239)',
                '--saito-blue': '#3c6177',
                '--saito-default-font': '#555',
                '--saito-paper': '#2e2e2e4f',
                '--saito-white': '#ffffff',
                '--saito-black': '#1c1c23',
                '--saito-black-faded': '#1c1c23b5',
                '--saito-font': '"Lato", sans-serif',
            },

        }
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