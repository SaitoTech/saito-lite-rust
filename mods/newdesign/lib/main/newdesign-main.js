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

    // Date picker
    const elem = document.querySelector('input[name="datepicker"]');
    const datepicker = new Datepicker(elem, {});




    // UserDrop Down
    const icons = document.querySelectorAll('.saito-user > i');
    const dropdowns = document.querySelectorAll('.saito-user-dropdown')

    icons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        console.log(icon.nextElementSibling);
        const dropdown = icon.nextElementSibling;
        if (dropdown.classList.contains('show')) {
          dropdown.classList.remove('show');
        } else {
          dropdown.classList.add('show');
        }

      });
    })
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('click', (e) => {
        dropdown.classList.remove('show');
      })
    })

    // functions

    const salert_btn = document.querySelector('#salert_btn');
    const sprompt_btn = document.querySelector('#sprompt_btn');
    const sconfirm_btn = document.querySelector('#sconfirm_btn');
    const sitemsg_btn = document.querySelector('#sitemsg_btn');

    salert_btn.addEventListener('click', (e) => {
      salert("Clicked Successfully");
    })
    sprompt_btn.addEventListener('click', (e) => {
      sprompt("Please insert something");
    })
    sconfirm_btn.addEventListener('click', (e) => {
      sconfirm("Activity Confirmed");
    })
    sitemsg_btn.addEventListener('click', (e) => {
      siteMessage("New site message");
    })

  };
}

module.exports = NewDesignMain;

