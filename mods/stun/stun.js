const saito = require('../../lib/saito/saito');
const Transaction = require("../../lib/saito/transaction").default;
const ModTemplate = require('../../lib/templates/modtemplate');

/***
 *  A generic utility for creating stun connections that other modules can use
 *  API is a combination of respondTo and event space
 * 
 * Will emit (with publicKey of peer):
 * 	'stun-connection-connected' --- when you have created the basic stun connection (for media streaming)
 *  'stun-connection-failed'
 *  'stun-data-channel-open'
 *  'stun-data-channel-close'
 * 
 * 	Your modules can set a listener for these and process accordingly
 */ 


class Stun extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Stun';

		this.description = 'P2P Connection Module';
		this.categories = 'Utilities Communications';

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

		this.peers = new Map();

	}

	respondTo(type, obj) {
		let stun_self = this;

		if (type === 'peer-manager') {
			return {
				hasConnection: (peerId) => {
					return this.hasConnection(peerId);
				},
				sendTransaction: (peerId, tx) => {
					this.sendTransaction(peerId, tx);
				},
				createPeerConnection: (peerId, callback = null) => {
					//
					// send ready message to peer, so if they want to create the channel, we are receptive
					//
					if (!callback){
						callback = (peerId) => {
							this.sendJoinTransaction(peerId);
						}			
					}

					if (Array.isArray(peerId)){
						peerId.forEach((peer) => this.createPeerConnection(peer, callback));
					}else{
						this.createPeerConnection(peerId, callback);	
					}
				},
				removePeerConnection: (peerId) => {
					this.removePeerConnection(peerId);
				},
				peers: this.peers
			};
		}

		return null;
	}

	hasConnection(peerId) {
		if (Array.isArray(peerId)){
			if (peerId.length == 0){ 
				return false;
			}
			let answer = true;
			for (let peer of peerId){
				if (!this.hasConnectionWithPeer(peer)){
					return false;
				}
			}
			return answer;
		}else{
			return this.hasConnectionWithPeer(peerId);
		}
	}

	hasConnectionWithPeer(peerId){
		let peerConnection = this.peers.get(peerId);

		if (peerConnection) {
			if (peerConnection?.dc) {
				if (peerConnection.connectionState == 'connected') {
					if (peerConnection.dc.readyState == "open"){
						return true;	
					}
				}
			}
		}

		return false;
	}

	sendTransaction(peerId, tx) {
		let peerConnection = this.peers.get(peerId);
		if (!peerConnection?.dc) {
			console.warn('Stun: no data channel with peer');
			return;
		}

		try {
			peerConnection.dc.send(tx.serialize_to_web(this.app));
		} catch (err) {
			console.error(err);
		}
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

					if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
						this.handleSignalingMessage(
							tx.from[0].publicKey,
							message.request,
							message
						);
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
				if (this.hasSeenTransaction(tx)) return;

				if (txmsg.module !== this.name) {
					return;
				}

				this.handleSignalingMessage(
					tx.from[0].publicKey,
					txmsg.request,
					txmsg
				);
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	async handleSignalingMessage(sender, request, data) {
		//
		// Stun metadata messages
		//
		if (request == 'peer-joined') {
			console.log("Stun: Peer joined (requested a connection)");
			this.createPeerConnection(sender);
			return;
		}

		if (request == 'peer-left') {
			this.removePeerConnection(sender);
			return;
		}

		let peerConnection = this.peers.get(sender);

		if (!peerConnection) {
			console.warn(
				'Receiving stun signalling messages for a non-peer connection'
			);
			return;
		}

		// Stun protocol messages
		if (request == 'peer-offer') {

			try{
				let offerCollision = this.makingOffer || peerConnection.signalingState != "stable";
				let ignoreOffer = offerCollision && peerConnection?.rude;
				if (ignoreOffer) {
					console.log("STUN: Impolite peer ignores offer collision");
					return;
				}

				let description = new RTCSessionDescription({ type: 'offer', sdp: data.sdp });

				if (offerCollision){
					await Promise.all([peerConnection.setLocalDescription({type: "rollback"}),
														 peerConnection.setRemoteDescription(description)]);
				}else{
					await peerConnection.setRemoteDescription(description);
				}

				await peerConnection.setLocalDescription(await peerConnection.createAnswer());
				this.peers.set(sender, peerConnection);
				this.sendPeerAnswerTransaction(sender, peerConnection.localDescription.sdp);
			}catch(err){
				console.error("STUN: failure in peer-offer --- ", err);
			}
			return;
		}

		if (request === 'peer-answer') {
			try{
				await peerConnection
				.setRemoteDescription(
					new RTCSessionDescription({ type: 'answer', sdp: data.sdp })
				);
				this.peers.set(sender, peerConnection);
			}catch(error){
				console.error('Error handling answer:', error);
			}

			return;
		}

		if (request === 'peer-candidate') {
			if (peerConnection.remoteDescription === null) return;
			peerConnection.addIceCandidate(data.iceCandidate).catch((error) => {
				console.error('Error adding remote candidate:', error);
			});
			return;
		}

		console.warn('Unknown Stun Peer Transaction!');
		console.log(data);
	}

	//
	// We treat all data channel messages a peer request / peer transaction
	//
	handleDataChannelMessage(data, peerId) {
		let relayed_tx = new Transaction();
		relayed_tx.deserialize_from_web(this.app, data);

		console.log("Data Channel Message: ", relayed_tx, relayed_tx.returnMessage());

		this.app.modules.handlePeerTransaction(relayed_tx);
	}

	async sendJoinTransaction(peer){
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(peer);

		newtx.msg = {
			module: 'Stun',
			request: 'peer-joined',
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	async sendPeerAnswerTransaction(peer, sdp) {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(peer);

		newtx.msg = {
			module: 'Stun',
			request: 'peer-answer',
			sdp
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	createPeerConnection(peerId, callback = null) {
		console.log('STUN: Create Peer Connection with ' + peerId + ` and ${callback?"a":"no"} callback`);

		if (peerId === this.publicKey) {
			console.log('STUN: Attempting to create a peer Connection with myself!');
			return 0;
		}

		this.makingOffer = false;

		if (this.peers.get(peerId)) {
			console.log('STUN: already connected to ' + peerId, "Status: " + this.peers.get(peerId).connectionState);
			this.peers.get(peerId).restartIce();
			
			if (callback){
				callback(peerId);
			}
			return;
		}else{
			const pc = new RTCPeerConnection({
				iceServers: this.servers
			})

			if (callback){
				pc.rude = true;
			}

			this.peers.set(peerId, pc);

			this.app.connection.emit("stun-new-peer-connection", peerId, pc);
		}

		const peerConnection = this.peers.get(peerId);
		
		// Handle ICE candidates
		peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				let data = {
					module: 'Stun',
					request: 'peer-candidate',
					iceCandidate: event.candidate
				};

				let tx =
					await this.app.wallet.createUnsignedTransactionWithDefaultFee(
						peerId
					);
				tx.msg = data;
				await tx.sign();

				this.app.network.propagateTransaction(tx);
				this.app.connection.emit('relay-transaction', tx);
			}
		};

		//Receive Remote media
		peerConnection.addEventListener('track', (event) => {
			this.app.connection.emit("stun-track-event", peerId, event);
		});

		peerConnection.addEventListener('connectionstatechange', () => {
			console.log(
				`STUN: ${peerId} connectionstatechange -- ` +
					peerConnection.connectionState
			);

			if (
				peerConnection.connectionState === 'failed' ||
				peerConnection.connectionState === 'disconnected'
			) {
				setTimeout(() => {
					if (
						peerConnection.connectionState === 'failed' ||
						peerConnection.connectionState === 'disconnected'
					) {
						this.app.connection.emit(
							'stun-connection-failed',
							peerId
						);
					}
				}, 3000);
			}
			if (peerConnection.connectionState === 'connected') {
				this.app.connection.emit('stun-connection-connected', peerId);
			}

			this.app.connection.emit(
				'stun-update-connection-message',
				peerId,
				peerConnection.connectionState
			);
		});


		const dc = peerConnection.createDataChannel('data-channel', {negotiated: true, id: 42});
		peerConnection.dc = dc;

		dc.onmessage = (event) => {
			this.handleDataChannelMessage(event.data, peerId);
		};

		dc.onopen = (event) => {
			console.log('STUN: Data channel is open');
			this.app.connection.emit('stun-data-channel-open', peerId);
		};

		dc.onclose = (event) => {
			console.log('STUN: Data channel is closed');
			this.removePeerConnection(peerId);
			this.app.connection.emit('stun-data-channel-close', peerId);
		};

		//
		// This handles the renegotiation for adding/droping media streams
		// However, need to further study "perfect negotiation" with polite/impolite peers
		//
		peerConnection.onnegotiationneeded = async () => {
			console.log(`STUN: Negotation needed! sending offer to ${peerId} with peer connection`);

			try {
				this.makingOffer = true;
				const offer = await peerConnection.createOffer({
					iceRestart: true,
					offerToReceiveAudio: true,
					offerToReceiveVideo: true,
				});

				if (peerConnection.signalingState != "stable"){
					return;
				}

				await peerConnection.setLocalDescription(offer);

				let newtx =
					await this.app.wallet.createUnsignedTransactionWithDefaultFee(
						peerId
					);

				newtx.msg = {
					module: 'Stun',
					request: 'peer-offer',
					sdp: peerConnection.localDescription.sdp
				};

				await newtx.sign();

				this.app.connection.emit('relay-transaction', newtx);
				this.app.network.propagateTransaction(newtx);
			} catch (err) {
				console.error('Error creating offer:', err);
			} finally {
				this.makingOffer = false;
			}

		};

		if (callback) {
			callback(peerId);
		}


	}

	//This can get double processed by PeerTransaction and onConfirmation
	//So need safety checks
	removePeerConnection(peerId) {
		const peerConnection = this.peers.get(peerId);
		if (peerConnection) {
			console.log("Stun remove peer connection!");
			peerConnection.close();
			this.peers.delete(peerId);
		}
	}

}

module.exports = Stun;
