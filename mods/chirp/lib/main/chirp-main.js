const chirpMainTemplate = require('./chirp-main.template');
const chirpWidgets = require('../chirp/chirp-widgets');

module.exports = ChirpMain = {

    render(app) {
        document.querySelector('.main-content').innerHTML = chirpMainTemplate(app);
        chirpWidgets.render(app);

    },

    attachEvents() {

    }

}