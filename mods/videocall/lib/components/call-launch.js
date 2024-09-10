const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const StunLaunchTemplate = require('./call-launch.template.js');
const CallSetting = require('../components/call-setting.js');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader.js');
const CallScheduleWizard = require('../../../../lib/saito/ui/saito-calendar/saito-schedule-wizard.js');
const CallScheduleJoin = require('./call-schedule-join.js');

/**
 *
 * This is a splash screen for initiating a Saito Video call
 *
 **/

class CallLaunch {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(app, mod);
		this.callSetting = new CallSetting(app, this);

		//
		//this looks a lot better if it is in the dom structure
		//
		// this.loader = new SaitoLoader(app, mod, ".stunx-appspace-splash");

		//
		// close-preview-window *also* shuts down the streams in call-settings
		//
		app.connection.on('close-preview-window', () => {
			this.overlay.remove();
			if (document.querySelector('.stun-appspace')) {
				document.querySelector('.stun-appspace').remove();
			}
		});

		app.connection.on('call-launch-enter-call', () => {
			this.enterCall()
		})
	}

	render() {
		if (document.querySelector('.stun-appspace')) {
			return;
		}
		if (this.container === '.saito-overlay') {
			this.overlay.show(StunLaunchTemplate(this.app, this.mod), () => {
				//Stop the video if we close the overlay
				this.app.connection.emit('close-preview-window');
			});
		} else if (this.container === 'body') {
			this.app.browser.addElementToDom(
				StunLaunchTemplate(this.app, this.mod)
			);
		}

		//
		// We should be able to toggle our video/audio controls
		// Do not make it a blocking loader
		//

		this.attachEvents(this.app, this.mod);

		this.callSetting.render();
	}

	attachEvents(app, mod) {
		if (document.getElementById('createRoom')) {
			document.getElementById('createRoom').onclick = (e) => {

				if (!this.mod.isRelayConnected) {
					siteMessage('Wait for peer connection');
					return;
				}

				//
				// I am initializing the call
				//
				console.log(this.mod.room_obj, "room object joining");
				if (!this.mod.room_obj) {
					this.mod.room_obj = {
						call_id: this.mod.createRoomCode(),
						host_public_key: this.mod.publicKey,
						call_peers: [],
						scheduled: false
					};
				}


				this.enterCall()
			};
		}
		if (document.getElementById('createScheduleRoom')) {
			document.getElementById('createScheduleRoom').onclick = async (e) => {
				this.callScheduleWizard = new CallScheduleWizard(app, mod)
				this.callScheduleWizard.callbackAfterSubmit =async function (app, mod, duration, description, utcStartTime) {
					const call_id = await mod.generateRoomId();
					const room_obj = {
						call_id,
						scheduled: true,
						call_peers: [],
						startTime: utcStartTime, 
						duration,
						description
					};
		
					const room_obj_stringified = JSON.stringify(room_obj);
					 let call_link =  mod.generateCallLink(room_obj)
					  app.keychain.addKey(call_id, { identifier: call_id, type: "scheduled_call", startTime:utcStartTime, duration, description, room_obj:room_obj_stringified, link:call_link  });
		
					  let event = {
						"datetime": new Date(utcStartTime),
						"duration": duration,
						"description": description || "Scheduled Call",
						"link": call_link,
						"type": "scheduled_call",
						"id": call_id
					  };  
					 app.connection.emit('calendar-render-request', event)
		
					await navigator.clipboard.writeText(call_link);
					siteMessage('New room link created and copied to clipboard', 1500);
				}


				this.callScheduleWizard.render()
			};
		}

		if (document.getElementById('joinScheduleRoom')) {
			document.getElementById('joinScheduleRoom').onclick = async (e) => {
				// show splash screen 
				this.callScheduleJoin = new CallScheduleJoin(app, mod)
				this.callScheduleJoin.render()
			};
		}
	}

	enterCall() {
		//
		// Set big screen video as desired call interface
		//
		if(!this.callSetting.videoInput){
			siteMessage("Waiting for media feed")
			return 
		}
		this.app.connection.emit('stun-init-call-interface', this.callSetting.returnSettings());

		//
		//Close this component
		//
		this.app.connection.emit('close-preview-window');
		//
		// Start the stun call
		//
		this.app.connection.emit('start-stun-call');
	}
}

module.exports = CallLaunch;
