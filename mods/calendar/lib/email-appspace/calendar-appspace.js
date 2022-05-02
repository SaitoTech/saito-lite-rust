const CalendarAppspaceTemplate 	= require('./calendar-appspace.template.js');
const CalendarMain = require('./calendar-main.js');
const CalendarSidebar = require('./calendar-sidebar.js');


module.exports = CalendarAppspace = {

    render(app, mod) {

      if (document.querySelector(".email-appspace")) {
        document.querySelector(".email-appspace").innerHTML = CalendarAppspaceTemplate();
      }
      if (document.querySelector(".large-calendar")) {
        document.querySelector(".large-calendar").innerHTML = CalendarAppspaceTemplate();
      }
      if (document.querySelector(".tiny-calendar")) {
        document.querySelector(".tiny-calendar").innerHTML = CalendarAppspaceTemplate();
      }

      CalendarMain.render(app, mod);
//      CalendarSidebar.render(app, mod);

    },


    attachEvents(app, mod) {
      CalendarMain.attachEvents(app, mod);
//      CalendarSidebar.attachEvents(app, mod);
    },

}




