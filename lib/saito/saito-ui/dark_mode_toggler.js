

class Toggler extends modal_templates {

    constructor(app) {
        super(app)
        this.app = this;

        this.themes = {
            light: {
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
                "--saito-font": '"Lato", sans-serif',
                "--saito-header-height": "92.2344px",
                "--saito-menu-background": "white",
                "--saito-profile-background": "white",
                "--saito-border": "#a5a5a5bb"
            },
            dark: {
                "--saito-background": "rgb(8, 8, 9)",
                "--saito-primary": "#730111",
                "--saito-secondary": "#682f0b",
                "--saito-tetiary": "rgb(234, 234, 239)",
                "--saito-blue": "#3c6177",
                "--saito-default-font": "rgb(143, 140, 140)",
                "--saito-paper": "#2e2e2e4f",
                "--saito-white": "#ffffff",
                "--saito-black": "#1c1c23",
                "--saito-black-faded": "#1c1c23b5",
                "--saito-font": '"Lato", sans-serif',
                "--saito-header-height": " 92.2344px",
                "--saito-menu-background": "black",
                "--saito-profile-background": "#1c1c23",
                "--saito-border": "#555"
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