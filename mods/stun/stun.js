const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const PeerManager = require('./lib/appspace/PeerManager');

const AppSettings = require('./lib/stun-settings');

class Stun extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Stun';

		this.description = 'P2P Connection Module';
		this.categories = 'Utilities Communications';

		this.screen_share = false;

		this.servers = [
			{
				urls: 'turn:stun-sf.saito.io:3478',
				username: 'guest',
				credential: 'somepassword'
			},
			{
				urls: 'turn:stun-sg.saito.io:3478',
				username: 'guest',
				credential: 'somepassword'
			},
			{
				urls: 'turn:stun-de.saito.io:3478',
				username: 'guest',
				credential: 'somepassword'
			}

			// Firefox gives a warning if you provide more than two servers and
			// throws an error if you use 5 or more.
			// is it redundant to have both turn and stun on the same server, since
			//
			// " TURN (Traversal Using Relay NAT) is the more advanced solution that incorporates
			// the STUN protocols and most commercial WebRTC based services use a TURN server
			// for establishing connections between peers. "

			/*{
        urls: "stun:stun-sf.saito.io:3478",
      },
      {
        urls: "stun:stun-sg.saito.io:3478",
      },
      {
        urls: "stun:stun-de.saito.io:3478",
      },*/
		];

		this.peerManager = new PeerManager(app, this);
	}



	respondTo(type, obj) {
		let stun_self = this;

		if (type === 'peer-manager') {
			return {};
		}

		return null;
	}


	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();

		if (conf === 0) {
			if (message.module === 'Stun') {

					if (this.app.BROWSER === 1) {
						if (this.hasSeenTransaction(tx)) return;

						if (
							!this?.room_obj?.room_code ||
							this.room_obj.room_code !== message.data.room_code
						) {
							console.log('OC: Tab is not active');
							return;
						}

						if (
							tx.isTo(this.publicKey) &&
							!tx.isFrom(this.publicKey)
						) {
							if (
								message.request ===
								'stun-send-call-list-request'
							) {
								console.log(
									'OnConfirmation:  stun-send-call-list-request'
								);
								this.receiveCallListRequestTransaction(
									this.app,
									tx
								);
							}
							if (
								message.request ===
								'stun-send-call-list-response'
							) {
								console.log(
									'OnConfirmation:  stun-send-call-list-response'
								);
								this.receiveCallListResponseTransaction(
									this.app,
									tx
								);
							}

							if (
								message.request === 'stun-send-message-to-peers'
							) {
								console.log(
									'OnConfirmation: stun-send-message-to-peers'
								);
								this.peerManager.handleSignalingMessage(
									tx.msg.data
								);
							}
						}
					}
			}
		}
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}
		let txmsg = tx.returnMessage();

		if (this.app.BROWSER === 1) {
			if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
				//console.log(txmsg);

				if (txmsg.request.substring(0, 10) == 'stun-send-') {
					if (this.hasSeenTransaction(tx)) return;

					if (
						!this?.room_obj?.room_code ||
						this.room_obj.room_code !== txmsg.data.room_code
					) {
						console.log('HPT: Tab is not active');
						return;
					}

					if (txmsg.request === 'stun-send-call-list-request') {
						console.log('HPT:  stun-send-call-list-request');
						this.receiveCallListRequestTransaction(this.app, tx);
						return;
					}
					if (txmsg.request === 'stun-send-call-list-response') {
						console.log('HPT:  stun-send-call-list-response');
						this.receiveCallListResponseTransaction(this.app, tx);
						return;
					}

					if (txmsg.request === 'stun-send-message-to-peers') {
						//console.log("HPT: stun-send-message-to-peers");
						this.peerManager.handleSignalingMessage(tx.msg.data);
						return;
					}

					console.warn('Unprocessed request:');
					console.log(txmsg);
				} else if (txmsg.request.substring(0, 5) == 'stun-') {
					this.dialer.receiveStunCallMessageFromPeers(tx);
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}


	async sendStunMessageToPeersTransaction(_data, recipients) {
		//console.log("sending to peers ", recipients, " data ", _data);
		let request = 'stun-send-message-to-peers';

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		if (recipients) {
			recipients.forEach((recipient) => {
				if (recipient) {
					newtx.addTo(recipient);
				}
			});
		}
		newtx.msg.module = 'Stun';
		newtx.msg.request = request;
		newtx.msg.data = _data;

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

		this.app.network.propagateTransaction(newtx);
	}

	async sendCallEntryTransaction(public_key = '') {
		if (!this.room_obj) {
			console.error('No room object');
			return;
		}

		if (!public_key) {
			public_key = this.room_obj?.host_public_key;
		}

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				public_key
			);

		let request = 'stun-send-call-list-request';

		newtx.msg.module = 'Stun';
		newtx.msg.request = request;

		let data = {
			room_code: this.room_obj.room_code
		};

		newtx.msg.data = data;
		newtx.msg.data.module = 'Stun';
		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	async receiveCallListRequestTransaction(app, tx) {
		let txmsg = tx.returnMessage();

		let from = tx.from[0].publicKey;
		let call_list = [];
		let peers = this.app.options?.stun?.peers;

		if (peers) {
			peers.forEach((key) => {
				if (!call_list.includes(key)) {
					call_list.push(key);
				}
			});
		}

		if (!call_list.includes(this.publicKey)) {
			call_list.push(this.publicKey);
		}

		console.log('STUN: call list', call_list);

		this.sendCallListResponseTransaction(from, call_list);
	}

	async sendCallListResponseTransaction(public_key, call_list) {
		let request = 'stun-send-call-list-response';
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(
				public_key
			);

		newtx.msg.module = 'Stun';
		newtx.msg.request = request;
		let data = {
			call_list,
			room_code: this.room_obj.room_code
		};

		newtx.msg.data = data;
		newtx.msg.data.module = 'Stun';

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

		this.app.network.propagateTransaction(newtx);
	}

	async receiveCallListResponseTransaction(app, tx) {
		let txmsg = tx.returnMessage();

		let call_list = txmsg.data.call_list;
		// remove my own key
		call_list = call_list.filter((key) => this.publicKey !== key);

		let room_code = txmsg.data.room_code;

		let _data = {
			type: 'peer-joined',
			public_key: this.publicKey,
			room_code
		};

		await this.sendStunMessageToPeersTransaction(_data, call_list);
	}

}

module.exports = Stun;
