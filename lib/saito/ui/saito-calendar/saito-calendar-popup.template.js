module.exports = SaitoCalendarPopupTemplate = (app, mod, day, month, year, events) => {

     let html = '';

     html += `

       <div class="saito-modal saito-modal-calendar" id="saito-modal-calendar">

	 <div class="saito-calendar-desc">
           <div class="saito-modal-title">Your Calendar</div>
	   <div class="saito-calendar-note">TIP: add events to your calendar by clicking on the name of other users/players and inviting them to future events!
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

