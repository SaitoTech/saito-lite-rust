const chirpMainTemplate = require('./chirp-main.template');


module.exports = ChirpMain = {

    render(app) {
        console.log
        document.querySelector('.main-content').innerHTML = chirpMainTemplate(app);

    },

    attachEvents() {

    }

}