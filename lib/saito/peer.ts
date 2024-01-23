import SaitoPeer from 'saito-js/lib/peer';

export default class Peer extends SaitoPeer {
	constructor(data: any, peerIndex?: bigint) {
		super(data, peerIndex);
	}
}
