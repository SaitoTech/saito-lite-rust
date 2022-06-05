const NewDesignMainTemplate = require('./newdesign-main.template');


class NewDesignMain {

  constructor(app) {
  };

  render(app) {
    if (!document.querySelector('.container')) {
      app.browser.addElementToDom(NewDesignMainTemplate(app));
    }
    this.attachEvents()
  };

  attachEvents() {
    const elem = document.querySelector('input[name="datepicker"]');
    const datepicker = new Datepicker(elem, {});

    /// Tabs 
    const tabButtons = document.querySelectorAll('.saito-tab-buttons li');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = button.dataset.target;
        const tabToDisplay = document.querySelector(target);


        const tabs = document.querySelectorAll('.saito-tab');
        tabButtons.forEach(button => {
          if (button.classList.contains('active')) {
            button.classList.remove('active');
          }
        })
        tabs.forEach(tab => {
          console.log('tab ', tab);
          tab.classList.remove('show');
        })


        console.log('tab to display ', tabToDisplay);
        tabToDisplay.classList.add('show');
        button.classList.add('active');
      })

    });

  };
}

module.exports = NewDesignMain;

