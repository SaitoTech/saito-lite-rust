const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const DialerTemplate = require('./dialer.template.js');
const SaitoUser = require('../../../../lib/saito/ui/saito-user/saito-user');

/**
 *
 * This is a splash screen for calling/answering a P2P Stun call
 *
 **/

class Dialer {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.receiver = {};
		this.call_log = [];
	}

	render(call_receiver, making_call = true) {
		if (Array.isArray(call_receiver)){
			for (let cr of call_receiver){
				if (!this.receiver[cr]) {
					this.receiver[cr] = new SaitoUser(
						this.app,
						this.mod,
						'.stun-minimal-appspace .contact',
						cr
					);
				} 
			}
		}else if (call_receiver) {
			if (!this.receiver[call_receiver]) {
				this.receiver[call_receiver] = new SaitoUser(
					this.app,
					this.mod,
					'.stun-minimal-appspace .contact',
					call_receiver
				);
			} 
		}

		this.overlay.show(
			DialerTemplate(this.app, this.mod, making_call),
			() => {
				console.log("Close dialer from exit button");
				console.log(making_call, this.mod.room_obj);
				if (making_call){
					this.app.connection.emit('relay-send-message', {
						recipient: Object.keys(this.receiver),
						request: 'stun-connection-request-cancel',
						data: this.mod.room_obj
					});

				}else{
					this.app.connection.emit('relay-send-message', {
						recipient: Object.keys(this.receiver),
						request: 'stun-connection-rejected',
						data: this.mod.room_obj
					});
				}
				this.remove();
			}
		);
		this.overlay.blockClose();

		for (let r of Object.values(this.receiver)){
			r.render();
		}

		this.attachEvents();
	}

	attachEvents() {
		let video_switch = document.getElementById('video_call_switch');
		let call_button = document.getElementById('startcall');

		let recipient = Object.keys(this.receiver);

		console.log("Send messages to: " + recipient);

		if (video_switch && call_button) {
			this.activateOptions();

			call_button.onclick = (e) => {
				if (this.call_log.length > 3) {
					salert(
						'You are making too many calls... please try again later'
					);
					return;
				}

				this.mod.room_obj.ui = video_switch.checked ? 'video' : 'voice';

				let data = Object.assign({}, this.mod.room_obj);

				this.app.connection.emit('relay-send-message', {
					recipient,
					request: 'stun-connection-request',
					data
				});

				this.ring_sound = new Audio('/saito/sound/Cloud_edit.mp3');
				this.startRing(4500);
				this.updateMessage('Dialing...');
				this.deactivateOptions();

				//
				// We will block you from trying to make more than 3 phone calls in a 60 second span
				// to prevent spamming
				//
				this.call_log.push(recipient);
				setTimeout(() => {
					if (this.call_log.length > 0) {
						this.call_log.shift();
					}
				}, 60000);

				this.dialing = setTimeout(() => {
					this.app.connection.emit('relay-send-message', {
						recipient,
						request: 'stun-connection-request-cancel',
						data
					});
					this.stopRing();
					call_button.innerHTML = 'Call';
					this.updateMessage('No answer');
					this.attachEvents();
				}, 3000);

				call_button.innerHTML = 'Cancel';

				call_button.onclick = (e) => {
					clearTimeout(this.dialing);
					this.app.connection.emit('relay-send-message', {
						recipient,
						request: 'stun-connection-request-cancel',
						data
					});
					this.remove();
				};
			};
		}

		let answer_button = document.getElementById('answercall');
		let reject_button = document.getElementById('rejectcall');

		if (answer_button) {
			answer_button.onclick = (e) => {
				this.app.connection.emit('relay-send-message', {
					recipient,
					request: 'stun-connection-accepted',
					data: this.mod.room_obj
				});

				this.remove(false);
				this.updateMessage('connecting...');

				setTimeout(() => {
					this.overlay.remove();
					this.app.connection.emit(
						'stun-init-call-interface',
						{
							ui: this.mod.room_obj.ui, 
							audio: true,
							video: this.mod.room_obj.ui == "video",
							auto_disconnect: true,
						}
					);
					this.app.connection.emit('start-stun-call');
				}, 1000);
			};
		}

		if (reject_button) {
			reject_button.onclick = (e) => {
				this.app.connection.emit('relay-send-message', {
					recipient,
					request: 'stun-connection-rejected',
					data: this.mod.room_obj
				});
				this.remove();
			};
		}
	}

	remove(closeOverlay = true){
		this.stopRing();
		this.app.connection.emit('close-preview-window');

		this.receiver = {};

		if (this.dialing) {
			clearTimeout(this.dialing);
			this.dialing = null;
		}

		if (closeOverlay){
			this.app.connection.emit('reset-stun');
			this.overlay.remove();
		}

	}

	startRing(interval) {
		if (this.ringer){
			clearInterval(this.ringer);
		}

		this.ring_sound.play();

		this.ringer = setInterval(()=>{
			try {
				this.ring_sound.play();
			} catch (err) {
				console.error(err);
			}

		}, interval);
	}

	stopRing() {
		try {
			if (this.ring_sound) {
				this.ring_sound.pause();
			}
			if (this.ringer){
				clearInterval(this.ringer);
				this.ringer = null;
			}

		} catch (err) {
			console.error(err);
		}
	}

	updateMessage(message) {
		let div = document.getElementById('stun-phone-notice');
		if (div) {
			div.innerHTML = message;
		}
	}

	activateOptions() {
		let div = document.querySelector('.video_switch');
		if (div) {
			div.classList.remove('deactivated');
		}

		let video_switch = document.getElementById('video_call_switch');

	}

	deactivateOptions() {
		let div = document.querySelector('.video_switch');
		div.classList.add('deactivated');

		let video_switch = document.getElementById('video_call_switch');
		video_switch.onchange = null;
	}

	async establishStunCallWithPeers(recipients) {
		// salert("Establishing a connection with your peers...");

		if (!this.mod.room_obj) {
  			await this.mod.createRoom();
  		}

		// send the information to the other peers and ask them to join the call
		recipients = recipients.filter((player) => {
			return player !== this.mod.publicKey;
		});

		this.render(recipients, true);
	}

	receiveStunCallMessageFromPeers(tx) {
		let txmsg = tx.returnMessage();
		let sender = tx.from[0].publicKey;
		let data = txmsg.data;

		switch (txmsg.request) {
		case 'stun-connection-request':
			//
			// Screen the call
			//
			let privacy = this.app.options.stun?.settings?.privacy || 'all';

			if (privacy == 'none') {
				return;
			}
			if (
				privacy == 'dh' &&
					!this.app.keychain.hasSharedSecret(sender)
			) {
				return;
			}

			if (
				privacy == 'key' &&
					!this.app.keychain.hasPublicKey(sender)
			) {
				return;
			}

			if (!this.mod.room_obj) {
				this.mod.room_obj = txmsg.data;
				this.render(sender, false);
				this.ring_sound = new Audio('/saito/sound/Reverie_edit.mp3');
				this.startRing(6000);

				//
				// Ping back to let caller know I am online
				//
				this.app.connection.emit('relay-send-message', {
					recipient: sender,
					request: 'stun-connection-ping',
					data
				});
			}

			console.log(this.mod.room_obj);

			break;

		case 'stun-connection-request-cancel':
			if (this.mod?.room_obj?.call_id == data.call_id) {
				this.remove();
				siteMessage(`${this.app.keychain.returnUsername(sender)} hung up`, 2000);
			}
			break;

		case 'stun-connection-rejected':
			this.stopRing();
			clearTimeout(this.dialing);
			this.updateMessage('did not answer');
			if (document.getElementById('startcall')) {
				document.getElementById('startcall').innerHTML = 'Call';
			}
			this.attachEvents();
			break;

		case 'stun-connection-accepted':

			this.remove(false);
			this.updateMessage('connecting...');

			setTimeout(() => {
				this.overlay.remove();
				this.app.connection.emit(
					'stun-init-call-interface',
						{
							ui: this.mod.room_obj.ui, 
							audio: true,
							video: this.mod.room_obj.ui == "video",
							auto_disconnect: true,
						}

				);
				this.app.connection.emit('start-stun-call');
			}, 1000);

			break;

		case 'stun-connection-ping':
			console.log('Counter party available, remain on the line');
			if (this.dialing) {
				clearTimeout(this.dialing);
				this.dialing = setTimeout(() => {
					this.app.connection.emit('relay-send-message', {
						recipient: sender,
						request: 'stun-connection-request-cancel',
						data
					});
					this.stopRing();

					if (document.getElementById('startcall')) {
						document.getElementById('startcall').innerHTML =
								'Call';
					}
					this.updateMessage('No answer');
					this.attachEvents();
				}, 29000);
			}

		default:
		}
	}
}

module.exports = Dialer;
