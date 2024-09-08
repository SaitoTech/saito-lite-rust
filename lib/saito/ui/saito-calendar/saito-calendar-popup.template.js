module.exports = SaitoCalendarPopupTemplate = (
	app,
	mod,
	day,
	month,
	year,
	events
) => {
	let events_html = '';
	console.log('HOW MANY EVENTS: ' + events.length);

	for (let i = 0; i < events.length; i++) {
		let invite = events[i];
		if (events[i].invite) {
			invite = events[i].invite;
		}

		if (i > 0) {
			events_html += '<p></p>';
		}

		let pd = new Date(invite.datetime);
		let d = app.browser.formatDate(pd.getTime());
		let eh = d.hours;
		let em = d.minutes;

		if (invite.title) {
			events_html += `
				<div class="saito-calendar-event">
					<div><strong>Event:</strong> ${invite.title}</div>
					<div><strong>Time:</strong> ${eh}:${em}</div>
				</div>`;
		} else if (invite.type === "scheduled_call" && invite.link) {
			events_html += `
				<div class="saito-calendar-event">
					<div><strong>Event:</strong> Scheduled Call</div>
					<div><strong>Time:</strong> ${eh}:${em}</div>
					<a class="" href="${invite.link}" target="_blank">Join Call</a>
				</div>`;
		}
	}

	let html = `
		<div class="saito-modal saito-modal-calendar" id="saito-modal-calendar">
			<div class="saito-modal-calendar-content">
				<div class="saito-modal-calendar-title">Calendar</div>
				<div class="saito-modal-calendar-note">TIP: Add events to your calendar by clicking on the name of other users/players and inviting them to scheduled events.
				</div>
			</div>

			<div class="saito-calendar-events">
				<div class="saito-calendar-events-date">${day}/${month}/${year}</div>
				<div class="saito-calendar-events-details">${events_html}</div>
			</div>
		</div>
	`;

	return html;
};
