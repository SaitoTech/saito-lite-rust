import saito_lib from '../../lib/saito/saito';
import Binary from '../../lib/saito/binary';
import Mods from '../../lib/saito/modules';
import Crypto from '../../lib/saito/crypto';
import Blockchain from '../../lib/saito/blockchain';
import Server from '../../lib/saito/core/server';
import Connection from '../../lib/saito/connection';
import Browser from '../../lib/saito/browser';
import Wallet from '../../lib/saito/wallet';
import Keychain from '../../lib/saito/keychain';
import Storage from '../../lib/saito/storage';
import build from '../../config/build.json';
import S, { LogLevel } from 'saito-js/saito';


import Network from '../../lib/saito/network';

import hash_loader from './hash-loader';

const path = require('path');

// let args =

export function parseLogLevel(logLevel): LogLevel {
    if (logLevel) {
        switch (logLevel) {
        case 'error':
            return LogLevel.Error;
        case 'warn':
            return LogLevel.Warn;
        case 'info':
            return LogLevel.Info;
        case 'debug':
            return LogLevel.Debug;
        case 'trace':
            return LogLevel.Trace;
        default:
            throw new Error('Invalid log level');
        }
    } else {
        return LogLevel.Info;
    }
}

export type ArgType = {
	loglevel?: string;
};

class Saito {
    BROWSER: number;
    SPVMODE: number;
    build_number: number;
    options: any = {};
    // config: any = {};
    modules: Mods;
    binary: Binary;
    crypto: Crypto;
    connection: Connection;
    browser: Browser;
    storage: Storage;
    wallet: Wallet;
    keychain: Keychain;
    network: Network;
    // networkApi: NetworkAPI;
    blockchain: Blockchain;
    hash: (data: Uint8Array) => string;
    server: Server;

    constructor(config = {}) {
        this.BROWSER = 1;
        this.SPVMODE = 0;
        this.build_number = Number(build.build_number);
        this.options = config;
        this.newSaito();

        // TODO : where does this mod_paths come from?
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.modules = new saito_lib.modules(this, config.mod_paths);

        return this;
    }

    newSaito() {
        this.binary = new Binary(this);
        this.crypto = new Crypto();
        this.connection = new Connection();
        this.browser = new Browser(this);
        this.storage = new Storage(this);
        // this.wallet = new Wallet(undefined,this);
        this.keychain = new Keychain(this);
        this.network = new Network(this);
        // this.networkApi = new NetworkAPI(this);
        // this.blockchain = new Blockchain(undefined);
    }

    async init() {
        try {
            // await this.storage.initialize();

            //
            // import hashing library here because of complications with both
            // performant blake3 library and less performant blake3-js that neeeds
            // to run in the browser but cannot be deployed via WASM.
            //
            await hash_loader(this);

            // NOV 29, changes to wallet, does it have app on init?
            await this.wallet.initialize();
            await this.keychain.initialize();

            this.modules.mods = this.modules.mods_list.map((mod_path) => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const Module = require(`./../../mods/${mod_path}`);
                const x = new Module(this);
                x.dirname = path.dirname(mod_path);
                return x;
            });

            console.log('setting current version : ' + this.wallet.version);

            await S.getInstance().setWalletVersion(
                0,
                Math.floor(this.wallet.version),
                (this.wallet.version * 1000) % 1000
            );

            // browser sets active module
            await this.browser.initialize(this);
            await this.modules.initialize();

            // blockchain after modules create dbs
            await this.blockchain.initialize();
            this.network.initialize();

            if (this.server) {
                this.server.initialize();
            }
        } catch (err) {
            console.error(
                'Error occured initializing your Saito install. The most likely cause of this is a module that is throwing an error on initialization. You can debug this by removing modules from your config file to test which ones are causing the problem and restarting.'
            );
            console.error(err);
        }
    }

    async reset(config) {
        console.log('resetting saito instance');
        this.options = config;
        this.newSaito();
        await this.init();
    }

    shutdown() {
        // TODO : couldn't find close method implementation
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.network.close();
    }
}

export { Saito, saito_lib };
