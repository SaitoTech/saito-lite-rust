import saito_lib from "../../lib/saito/saito";
import Binary from "../../lib/saito/binary";
import Mods from "../../lib/saito/modules";
import Crypto from "../../lib/saito/crypto";
import UtxoSet from "../../lib/saito/utxoset";
import Blockchain from "../../lib/saito/blockchain";
import Blockring from "../../lib/saito/blockring";
import Server from "../../lib/saito/core/server";
import Connection from "../../lib/saito/connection";
import Browser from "../../lib/saito/browser";
import GoldenTicket from "../../lib/saito/goldenticket";
import Mempool from "../../lib/saito/mempool";
import Wallet from "../../lib/saito/wallet";
import Miner from "../../lib/saito/miner";
import Keychain from "../../lib/saito/keychain";
import BurnFee from "../../lib/saito/burnfee";
import Storage from "../../lib/saito/storage";
import NetworkAPI from "../../lib/saito/networkapi";
import Network from "../../lib/saito/network";
import Staking from "../../lib/saito/staking";


import hash_loader from "./hash-loader";
import Handshake from "../../lib/saito/handshake";

const path = require("path");

class Saito {
  BROWSER: number;
  SPVMODE: number;
  options: any = {};
  config: any = {};
  modules: Mods;
  binary: Binary;
  crypto: Crypto;
  connection: Connection;
  browser: Browser;
  storage: Storage;
  goldenticket: GoldenTicket;
  utxoset: UtxoSet;
  mempool: Mempool;
  wallet: Wallet;
  miner: Miner;
  keys: Keychain;
  network: Network;
  staking: Staking;
  networkApi: NetworkAPI;
  burnfee: BurnFee;
  blockchain: Blockchain;
  blockring: Blockring;
  handshake: Handshake;
  hash: (data: string) => string;
  server: Server;


  constructor(config = {}) {
    this.BROWSER = 1;
    this.SPVMODE = 0;
    this.options = config;
    this.config = {};

    this.newSaito();

    // TODO : where does this mod_paths come from?
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.modules = new saito_lib.modules(this, config.mod_paths);

    return this;
  }

  newSaito() {
    this.binary = new Binary(this);
    this.crypto = new Crypto(this);
    this.connection = new Connection();
    this.browser = new Browser(this);
    this.storage = new Storage(this);
    this.goldenticket = new GoldenTicket(this);
    this.utxoset = new UtxoSet();
    this.mempool = new Mempool(this);
    this.wallet = new Wallet(this);
    this.miner = new Miner(this);
    this.keys = new Keychain(this);
    this.network = new Network(this);
    this.networkApi = new NetworkAPI(this);
    this.burnfee = new BurnFee();
    this.blockchain = new Blockchain(this);
    this.blockring = new Blockring(this, this.blockchain.returnGenesisPeriod());
    this.staking = new Staking(this);
    this.handshake = new Handshake(this);
   
  
  }

  async init() {
    try {
      await this.storage.initialize();

      //
      // import hashing library here because of complications with both
      // performant blake3 library and less performant blake3-js that neeeds
      // to run in the browser but cannot be deployed via WASM.
      //
      await hash_loader(this);

      this.wallet.initialize();
      this.mempool.initialize();
      this.miner.initialize();
      this.keys.initialize();

      this.modules.mods = this.modules.mods_list.map((mod_path) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Module = require(`./../../mods/${mod_path}`);
        const x = new Module(this);
        x.dirname = path.dirname(mod_path);
        return x;
      });

      //
      // browser sets active module
      //
      await this.browser.initialize(this);
      await this.modules.initialize();

      //
      // blockchain after modules create dbs
      //
      await this.blockchain.initialize();

      this.network.initialize();

      if (this.server) {
        this.server.initialize();
      }
    } catch (err) {
      console.log(
        "Error occured initializing your Saito install. The most likely cause of this is a module that is throwing an error on initialization. You can debug this by removing modules from your config file to test which ones are causing the problem and restarting."
      );
      console.log(err);
    }
  }

  async reset(config) {
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
