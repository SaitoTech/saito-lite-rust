const ChirpWidgetsTemplate = require('./chirp-widgets.template');

module.exports = ChirpWidgets = {

  render(app, mod) {

    //
    // only add elements to DOM if we find expected elements missing.
    //
    if (!document.querySelector(".tiny-calendar")) { app.browser.addElementToDom(ChirpWidgetsTemplate(), "widgets"); }

    //
    // render calendar if installed
    //
    app.modules.respondTo("tiny-calendar").forEach(module => {
      if (module != null) {
        module.respondTo('tiny-calendar').render(app, module);
      }
    });

  },

  
  attachEvents(app, mod) {
  
    //
    // let chat module work its wonders
    //
    app.modules.respondTo("tiny-calendar").forEach(module => {
      module.respondTo('tiny-calendar').attachEvents(app, module);
    });

  }

}

