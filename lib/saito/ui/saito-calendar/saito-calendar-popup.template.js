module.exports  = (
	app,
	mod,
	day,
	month,
	year,
	events
) => {

	let events_html = '';
	console.log('HOW MANY EVENTS: ' + events.length);

	events.sort((a, b) => {
		let dateA = new Date(a.invite ? a.invite.startTime : a.startTime);
		let dateB = new Date(b.invite ? b.invite.startTime : b.startTime);
		return dateA - dateB; 
	});

	if (events.length === 0) {
		events_html += '<p> No events today <p>';
	}

	for (let i = 0; i < events.length; i++) {
		let invite = events[i];
		if (events[i].invite) {
			invite = events[i].invite;
		}

		let pd = new Date(invite.startTime);
		let d = app.browser.formatDate(pd.getTime());
		let eh = d.hours;
		let em = d.minutes;

		events_html += `
			<div class="saito-calendar-event">
				<div><strong>Event:</strong> ${invite?.title ? invite.title : invite.mod }</div>
				<div><strong>Time:</strong> ${eh}:${em}</div>`;

		if (invite?.duration){
			events_html += `<div><strong>Duration:</strong> ${invite.duration}</div>`;
		}

		if (invite?.link){
			events_html +=	`<a class="" href="${invite.link}">Join Event</a>`;
		}
		events_html += `</div>`;

	}

	let html = `
		<div class="saito-modal saito-modal-calendar" id="saito-modal-calendar">
			<div class="saito-modal-calendar-tabs">
				<div class="saito-tab-button active" >Today's Events</div>
				<div class="saito-tab-button" >Schedule Event</div>
			</div>
			<div class="saito-calendar-events">
				<div class="saito-calendar-events-date">${day}/${month}/${year}</div>
				<div class="saito-calendar-events-details" id="tab1">${events_html}</div>
				<div class="saito-calendar-events-details" id="tab2" style="display:none;">
				<div class="saito-modal-calendar-content">
				<div class="saito-calendar-event-actions"> 
				</div>
				</div> 
				</div>
			</div>
		</div>
	`;

	return html;
};
