module.exports = SaitoCalendarPopupTemplate = (app, mod, day, month, year, events) => {

     let html = '';

     html += `

       <div id="saito-calendar-popup" class="saito-calendar-popup">
	
	<div class="saito-calendar-events">
	  <div class="saito-calendar-events-date">${day}/${month}/${year}</div>
	  <div class="saito-calendar-events-details">
${JSON.stringify(events)}
	  </div>
        </div>
	<div id="invites-new-invite" class="invites-new-invite saito-button-secondary">schedule event</div>
       </div>

     `;

     return html;
}
