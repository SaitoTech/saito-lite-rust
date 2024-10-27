import Transaction from './transaction';
import Peer from './peer';
import S from 'saito-js/saito';
import { Saito } from '../../apps/core';
import PeerService from 'saito-js/lib/peer_service';

export default class Network {
	callbacks = [];
	app: Saito;

	constructor(app: Saito) {
		this.app = app;
	}

	initialize() {
		console.debug('[DEBUG] initialize network');
	}

	public async propagateTransaction(tx: Transaction) {
		return S.getInstance().propagateTransaction(tx);
	}

	public async getPeers(): Promise<Array<Peer>> {
		return S.getInstance().getPeers();
		
	}

	public async getPeer(index: bigint): Promise<Peer> {
		return S.getInstance().getPeer(index);
	}

	public async sendRequest(
		message: string,
		data: any = '',
		callback: null,
		peer: Peer = null
	) {
		let buffer = Buffer.from(JSON.stringify(data), 'utf-8');
		return S.getInstance().sendRequest(
			message,
			data,
			callback,
			peer ? peer.peerIndex : undefined
		);
	}

	public async sendTransactionWithCallback(
		transaction: Transaction,
		callback?: any,
		peerIndex?: bigint
	) {
		return S.getInstance().sendTransactionWithCallback(
			transaction,
			callback,
			peerIndex
		);
	}

	/*
	You don't need to await this function, but it will pass back any return value
	from the callback you provide (hopefully)
  */
	public async sendRequestAsTransaction(
		message: string,
		data: any = '',
		callback?: any,
		peerIndex?: bigint
	) {
		return S.getInstance().sendRequest(message, data, callback, peerIndex);
	}

	public close() { }

	async addStunPeer(public_key, peerConnection) {	
		await  S.getInstance().addStunPeer(public_key, peerConnection);
	}

	initializeStun() {
		throw new Error('not implemented');
	}

	returnPeersWithService() { }


	createPeerService(data, service, name, domain) {
		let ps = new PeerService(data, service, name, domain);
  		return ps;
	}

	async connectToArchivePeer(peerIndex, peerDetails, data, message, internal_callback, error_callback = null  ){
	let {publicKey, host, port, url} = peerDetails
		try {
			await S.getLibInstance().add_new_archive_peer(peerIndex, publicKey, host, port);
			console.log("connecting to " + url + "....");
			let socket = new WebSocket(url);
			socket.binaryType = "arraybuffer";
			S.getInstance().addNewSocket(socket, peerIndex);
			socket.onmessage = (event: MessageEvent) => {
				try {
					S.getLibInstance().process_msg_buffer_from_peer(new Uint8Array(event.data), peerIndex);
				} catch (error) {
					console.error(error);
				}
			};
			socket.onopen = () => {
				this.app.network.sendRequestAsTransaction(
					message,
					data,
					(res) => {
						internal_callback(res);
					},
					peerIndex
				);
			};
			socket.onclose = () => {
				try {
					console.log("socket.onclose : " + peerIndex);
					S.getLibInstance().process_peer_disconnection(peerIndex);
				} catch (error) {
					console.error(error);
				}
			};
			socket.onerror = (error) => {
				try {
					console.error(`socket.onerror ${peerIndex}: `, error);
					S.getInstance().removeSocket(peerIndex);
				} catch (error) {
					console.error(error);
				}
			}
		} catch (e) {
			console.error("error occurred while opening socket : ", e)
		}
	}

	public getServices(): PeerService[] {
		let my_services = [];
		for (let i = 0; i < this.app.modules.mods.length; i++) {
			let module = this.app.modules.mods[i];
			let modservices: PeerService[] = module.returnServices();
			for (let k = 0; k < modservices.length; k++) {
				my_services.push(modservices[k]);
			}
		}
		return my_services;
	}
}
