module.exports = SaitoCalendarPopupTemplate = (app, mod, day, month, year, events) => {

     let events_html = "";
console.log("HOW MANY EVENTS: " + events.length);
     for (let i = 0; i < events.length; i++) {

       let invite = events[i];
       if (events[i].invite) { invite = events[i].invite; }

       if (i > 0) { events_html += '<p></p>'; }

       let pd = new Date(invite.datetime);
       let d = app.browser.formatDate(pd.getTime());
       let eh = d.hours;
       let em = d.minutes;

       events_html += `${eh}:${em} ${invite.title}`;

     }

     html = `

       <div class="saito-modal saito-modal-calendar" id="saito-modal-calendar">

	 <div class="saito-modal-calendar-content">
           <div class="saito-modal-calendar-title">Calendar</div>
	   <div class="saito-modal-calendar-note">TIP: add events to your calendar by clicking on the name of other users/players and inviting them to scheduled events.
	   </div>
	 </div>
	
  	 <div class="saito-calendar-events">
	   <div class="saito-calendar-events-date">${day}/${month}/${year}</div>
	   <div class="saito-calendar-events-details">${events_html}</div>
         </div>

       </div>

     `;

     return html;
}

