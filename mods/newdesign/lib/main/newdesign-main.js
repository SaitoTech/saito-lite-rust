const NewDesignMainTemplate = require('./newdesign-main.template');


module.exports = {

  render(app) {
    if (!document.querySelector('.container')) {
      app.browser.addElementToDom(NewDesignMainTemplate(app));
    }

    this.attachEvents()


  },

  attachEvents() {
    const elem = document.querySelector('input[name="datepicker"]');
    const datepicker = new Datepicker(elem, {

    })

  }



}
