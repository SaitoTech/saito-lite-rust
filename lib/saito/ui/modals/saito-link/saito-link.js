const InvitationLinkTemplate = require('./saito-link.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class InvitationLink {
	constructor(app, mod, data = {}) {
		this.app = app;
		this.mod = mod;
		this.data = data;
		this.overlay = new SaitoOverlay(app, mod);
		this.invite_link = '';
	}

	render(display = true) {
		this.buildLink();
		if (display){
			this.overlay.show(InvitationLinkTemplate(this.app, this.data));
			this.attachEvents();
		}else{
			navigator.clipboard.writeText(this.invite_link);
			let game = this.data.name || this.data.game;
			siteMessage(`${game} invite link copied to clipboard`, 2500);
		}
	}

	attachEvents() {
		try {
			document
				.querySelector('#copy-invite-link')
				.addEventListener('click', (e) => {
					navigator.clipboard.writeText(this.invite_link);
					this.overlay.remove();
				});
		} catch (err) {
			console.error(err);
		}

		if (document.getElementById("chat-invite-link")){
			document.getElementById("chat-invite-link").onclick = (e) => {
				this.app.connection.emit("chat-message-user", "community", this.invite_link);
				this.app.connection.emit("open-chat-with");
				this.overlay.remove();
			} 
		}

		if (document.getElementById("tweet-invite-link")){
			document.getElementById("tweet-invite-link").onclick = (e) => {			
				navigator.clipboard.writeText(this.invite_link);
				this.overlay.remove();
				this.app.connection.emit("redsquare-new-post", this.invite_link);
			}
		}
	}

	buildLink() {
		this.invite_link = window.location.origin;
		let path = this.data?.path || window.location.pathname;

		this.invite_link += path;

		//Make sure we have the final /
		if (this.invite_link.slice(-1) != '/') {
			this.invite_link += '/';
		}

		for (let key in this.data) {
			if (key !== 'path' && key !== 'name') {
				this.invite_link += '&' + key + '=' + this.data[key];
			}
		}

		this.invite_link = this.invite_link.replace('/&', '/?');

		console.log(this.invite_link);
	}
}

module.exports = InvitationLink;
