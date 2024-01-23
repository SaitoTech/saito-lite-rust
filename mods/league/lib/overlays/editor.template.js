module.exports = (app, mod, league) => {
	let html = `
     <div class="league-edit-overlay-box">`;
	if (league.admin) {
		html += `<div class="label">Contact Info</div>
     <div class="box contact" contenteditable="true">${league.contact}</div>
     <div class="label">Welcome Message</div>
     <div class="box welcome" contenteditable="true">${league.welcome}</div>`;
	}

	html += `<div class="label">${
		league.admin ? 'League' : 'Game'
	} Description</div>
     <div class="box description" contenteditable="true">${
	league.description
}</div>
     <button type="button" class="submit_btn saito-button saito-button-primary">Update</button>
     </div>`;

	return html;
};
