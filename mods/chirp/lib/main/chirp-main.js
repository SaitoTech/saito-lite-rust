const chirpMainTemplate = require('./chirp-main.template');
const chirpFeed = require('../components/chirp-feed');


module.exports = ChirpMain = {

    render(app){
            document.querySelector('.main-content').innerHTML = chirpMainTemplate(app);
            chirpFeed.render(app);
    },

    attachEvents(){

    }
   
}