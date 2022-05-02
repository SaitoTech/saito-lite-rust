const CalendarMainTemplate 	= require('./calendar-main.template.js');


module.exports = CalendarMain = {

    render(app, mod) {

      if (document.querySelector(".calendar-main")) {
        document.querySelector(".calendar-main").innerHTML = CalendarMainTemplate("calendar_box_main");
      }
      if (document.querySelector(".tiny-calendar")) {
        document.querySelector(".tiny-calendar").innerHTML = CalendarMainTemplate("tiny-calendar-box");
      }
      if (document.querySelector(".large-calendar")) {
        document.querySelector(".large-calendar").innerHTML = CalendarMainTemplate("large-calendar-box");
      }

      this.renderMonth(app, mod);

    },

    attachEvents(app, mod) {
    },



    renderMonth(app, mod) {

      //
      // convert appointments to calendar event-format
      //
      let uevents = [];
      for (let i = 0; i < mod.appointments.length; i++) {
	let txmsg = mod.appointments[i].returnMessage();
	uevents.push(txmsg);
      }

      let caldiv = "calendar-box-main";

      if (document.querySelector(".calendar-main")) {
        caldiv = "calendar-box-main";
        document.querySelector(".calendar-main").innerHTML = CalendarMainTemplate("calendar-box-main");
      }
      if (document.querySelector(".tiny-calendar")) {
        caldiv = "tiny-calendar-box";
        document.querySelector(".tiny-calendar").innerHTML = CalendarMainTemplate("tiny-calendar-box");
      }
      if (document.querySelector(".large-calendar")) {
        caldiv = "large-calendar-box";
        document.querySelector(".large-calendar").innerHTML = CalendarMainTemplate("large-calendar-box");
      }


      var calendarEl = document.getElementById(caldiv);
      calendarEl.innerHTML = "";
      var calendar = new FullCalendar.Calendar(calendarEl, {

	fixedWeekCount: false,

	aspectRatio: 1.8,

	contentHeight: "auto",

        plugins: [ 'dayGrid' ],

	events: uevents,

  	dayRender:(dayRenderInfo) => {
          dayRenderInfo.el.innerHTML = '<div class="calendar-day"><div class="calendar-day-appointment-num"></div></div>';
	  console.log("DAY INFO: " + dayRenderInfo.date);
	  dayRenderInfo.el.onclick = () => {

	    if (mod.overlay_calendar_active == 1) {
	      alert("Clicking on Large Calendar Overlay");
	    }

	    if (mod.tiny_calendar_active == 1 && mod.overlay_calendar_active == 0) {
	      let html = `<div class="large-calendar" id="large-calendar"></div>`;
	      mod.overlay.showOverlay(app, mod, html, function() {
                mod.overlay_calendar_active = 0;
		document.getElementById("large-calendar").remove();
	        mod.renderLargeCalendar(app, mod);
	      });
	      mod.renderLargeCalendar(app, mod);
              mod.overlay_calendar_active = 1;
	    }

//            this.renderDayCalendar(app, mod, dayRenderInfo.date);

          }
  	},
      });
      calendar.render();
      calendar.updateSize();
    },


/*****
    renderDayCalendar(app, mod, renderdaydate) {

      //
      // convert appoints to working format
      //
      let uevents = [];
      for (let i = 0; i < mod.appointments.length; i++) {
	uevents.push(mod.appointments[i].returnMessage()));
      }

      var calendarEl = document.getElementById('calendar-box');
      calendarEl.innerHTML = "";
      var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [ 'list' ],
        defaultView: 'listDay',
        views: {
          listDay: { buttonText: 'list day' },
          listWeek: { buttonText: 'list week' },
          listMonth: { buttonText: 'list month' },
        },
        events: uevents,

	noEventsMessage: "No events to display",

      });

      calendar.render();

//      CalendarAddEventSidebar.render(app, mod);
//      CalendarAddEventSidebar.attachEvents(app, mod);

    },
*****/

}




