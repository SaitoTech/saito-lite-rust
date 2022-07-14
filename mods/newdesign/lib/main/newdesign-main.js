const UIModTemplate = require('../../../../lib/templates/uimodtemplate');
const NewDesignMainTemplate = require('./newdesign-main.template');

class NewDesignMain {

  constructor(app) {
  };

  render(app) {
    if (document.querySelector('#saito-container')) {
      app.browser.addElementToDom(NewDesignMainTemplate(app));
    }

    this.attachEvents();

  };

  attachEvents() {

    // Date picker
    const elems = document.querySelectorAll('input[name="datepicker"]');

    elems.forEach(elem => {
      let datepicker = new Datepicker(elem, {});
    })



    console.log('attaching events');
    // functions
    const salert_btn = document.querySelector('#salert_button');
    const sprompt_btn = document.querySelector('#sprompt_button');
    const sconfirm_btn = document.querySelector('#sconfirm_button');
    const sitemsg_btn = document.querySelector('#sitemsg_button');


    document.body.addEventListener('click', (e) => {
      if (e.target.id === "salert_button") {
        salertNew("Clicked Successfully");
      }
      if (e.target.id === "sprompt_button") {
        spromptNew("Please insert something");
      }
      if (e.target.id === "sconfirm_button") {
        sconfirmNew("Activity Confirmed");
      }
      if (e.target.id === "sitemsg_button") {
        siteMessageNew("New site message");
      }
      if (e.target.id === "showoverlay_button") {
        document.querySelector('.saito-overlay').classList.add('show');
      }
      if (e.target.classList.contains("close-overlay")) {
        document.querySelector('.saito-overlay').classList.remove('show');
      }



      if (e.target.classList.contains('hamburger')) {
        console.log(e.target.parentElement);

        const mobileSidebar = e.target.parentElement.querySelector('.saito-sidebar.left');
        mobileSidebar.classList.contains('mobile') ? mobileSidebar.classList.remove('mobile') : mobileSidebar.classList.add('mobile');

      }

    })

    // hamburger menu
    // const mobileHamburger = document.querySelectorAll('.saito-sidebar.left hamburger')
    // mobileHamburger.forEach(item => {
    //   document.body.addEventListener('click', (e) => {
    //     console.log(item.parentElement);
    //     const mobileSidebar = item.parentElement.querySelector('.saito-sidebar.mobile');
    //     mobileSidebar.classList.contains('show-left-sidebar-mobile') ? mobileSidebar.classList.remove('show-left-sidebar-mobile') : mobileSidebar.classList.add('show-left-sidebar-mobile');
    //   })
    // })

  };
}

module.exports = NewDesignMain;

