module.exports = SaitoCalendarPopupTemplate = (app, mod) => {

     let html = '';

     html += `

       <div id="saito-calendar-popup" class="saito-calendar-popup">
	
	<div class="saito-calendar-events">no events</div>

	<div class="saito-button-secondary">add one for today</div>
	<div class="saito-button-secondary">schedule for later</div>
       </div>

     `;

     return html;
}
