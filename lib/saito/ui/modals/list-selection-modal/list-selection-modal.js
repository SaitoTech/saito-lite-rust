const ListSelectionModalTemplate= require('./list-selection-modal.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');


 class ListSelectionModal {

  constructor(app, callback = () => { }) {
    this.app = app;
    this.callback = callback;
  }


  render(app, title, prompt, list) {
  
    let overlay = new SaitoOverlay(app);
  
    overlay.show(app, null, ListSelectionModalTemplate(title, prompt, list));

    Array.from(document.querySelectorAll('#selection-list li')).forEach(game => {
      game.addEventListener('click', (e) => {
        let gameName = e.target.getAttribute("data-id");
        overlay.remove();
        console.log(gameName);
        this.callback(gameName);
      });
    });

    console.log(this.callback);
  }
  
}


module.exports = ListSelectionModal;

