module.exports = SaitoCalendarPopupTemplate = (app, mod, day, month, year, events) => {

     let html = '';

     html += `

       <div class="saito-modal saito-modal-calendar" id="saito-modal-calendar">

	 <div class="saito-modal-calendar-content">
           <div class="saito-modal-calendar-title">Calendar</div>
	   <div class="saito-modal-calendar-note">TIP: add events to your calendar by clicking on the name of other users/players and inviting them to scheduled events.
	   </div>
	 </div>
	
  	 <div class="saito-calendar-events">
	   <div class="saito-calendar-events-date">${day}/${month}/${year}</div>
	   <div class="saito-calendar-events-details">
${JSON.stringify(events)}
	 </div>

       </div>

     `;

     return html;
}

