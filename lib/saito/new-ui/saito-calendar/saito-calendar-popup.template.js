module.exports = SaitoCalendarPopupTemplate = (app, mod) => {

     let html = '';

     html += `

       <div id="saito-calendar-popup" class="saito-calendar-popup">
	
	<div class="saito-calendar-events">no events today</div>

	<div class="saito-button-secondary">schedule event</div>
       </div>

     `;

     return html;
}
