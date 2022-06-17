const ChirpMainTemplate = require('./chirp-main.template');

class ChirpMain {

  constructor(app) {
  };

  render(app) {
    if (!document.querySelector('.container')) {
      app.browser.addElementToDom(ChirpMainTemplate(app));
    }
    this.attachEvents();
  };

  attachEvents() {
    // hamburger menu
    if (document.querySelectorAll('.saito-left-sidebar-hamburger')) {
      const mobileHamburger = document.querySelectorAll('.saito-left-sidebar-hamburger')
      mobileHamburger.forEach(item => {
        item.addEventListener('click', (e) => {
          console.log(item.parentElement);
          const mobileSidebar = item.parentElement.querySelector('.saito-left-sidebar-mobile');
          mobileSidebar.classList.contains('show-left-sidebar-mobile') ? mobileSidebar.classList.remove('show-left-sidebar-mobile') : mobileSidebar.classList.add('show-left-sidebar-mobile');
        })
      })
    }

  };
}

module.exports = ChirpMain;

