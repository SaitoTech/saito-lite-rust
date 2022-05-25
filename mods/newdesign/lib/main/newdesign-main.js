const NewDesignMainTemplate = require('./newdesign-main.template');

module.exports = NewDesignMain = {

    render(app) {
      if (!document.querySelector('.container')) {
        app.browser.addElementToDom(NewDesignMainTemplate(app));
      }
    },

}
