import binary0 from './binary';

// import blockring0 from "./blockring";

import blockchain0 from './blockchain';

import block0 from './block';

import browser0 from './browser';

// import burnfee0 from "./burnfee";

import connection0 from './connection';

import crypto0 from './crypto';

// import hop0 from "./hop";

// import goldenticket0 from "./goldenticket";

import keychain0 from './keychain';

// import miner0 from "./miner";

import modules0 from './modules';

// import mempool0 from "./mempool";

import network0 from './network';

// import networkapi from "./networkapi";

import peer0 from './peer';

import storage0 from './storage';

import server0 from './server';

// import utxoset0 from "./utxoset";

import slip0 from './slip';

import transaction0 from './transaction';

import wallet0 from './wallet';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

export default class SaitoCommon {
	static binary = binary0;
	static block = block0;
	static blockchain = blockchain0;
	// static blockring = blockring0;
	static browser = browser0;
	// static burnfee = burnfee0;
	static connection = connection0;
	static crypto = crypto0;
	// static hop = hop0;
	// static goldenticket = goldenticket0;
	static keychain = keychain0;
	// static miner = miner0;
	static modules = modules0;
	// static mempool = mempool0;
	static network = network0;
	// static networkApi = networkapi;
	static peer = peer0;
	static storage = storage0;
	static server = server0;
	// static utxoset = utxoset0;
	static slip = slip0;
	static transaction = transaction0;
	static wallet = wallet0;
}
