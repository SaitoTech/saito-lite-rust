import Transaction from "./transaction";
import Slip from "./slip";
import { Saito } from "../../apps/core";
import S from "saito-js/saito";

const CryptoModule = require("../templates/cryptomodule");

export default class Wallet {
  public app: Saito;
  public wallet = {
    balance: "0",
    publickey: "",
    privatekey: "",

    preferred_crypto: "SAITO",
    preferred_txs: [],

    inputs: new Array<Slip>(), // slips available
    outputs: new Array<Slip>(), // slips spenr
    spends: [], // TODO -- replace with hashmap using UUID. currently array mapping inputs -> 0/1 whether spent
    pending: [], // slips pending broadcast
    default_fee: 2,
    version: 4.685,
  };
  public inputs_hmap: Map<string, boolean>;
  public inputs_hmap_counter: number;
  public inputs_hmap_counter_limit: number;
  public outputs_hmap: Map<string, boolean>;
  public outputs_hmap_counter: number;
  public outputs_hmap_counter_limit: number;
  public outputs_prune_limit: number;
  public recreate_pending_transactions: any;
  public saitoCrypto: any;

  public async createUnsignedTransactionWithDefaultFee(
    publickey = "",
    amount = BigInt(0)
  ): Promise<Transaction> {
    if (publickey == "") {
      publickey = await this.getPublicKey();
    }
    return this.createUnsignedTransaction(publickey, amount, BigInt(0));
  }

  public async createUnsignedTransaction(
    publicKey = "",
    amount = BigInt(0),
    fee = BigInt(0),
    force_merge = false
  ): Promise<Transaction> {
    return S.getInstance().createTransaction(publicKey, amount, fee, force_merge);
  }

  public async signTransaction(tx: Transaction) {
    return S.getInstance().signTransaction(tx);
  }

  public async getPublicKey(): Promise<string> {
    return S.getInstance().getPublicKey();
  }

  public async getPendingTransactions(): Promise<Array<Transaction>> {
    return S.getInstance().getPendingTransactions();
  }

  public async signAndEncryptTransaction(tx: Transaction) {
    return S.getInstance().signAndEncryptTransaction(tx);
  }

  public async getBalance(ticker = "SAITO"): Promise<bigint> {
    if (ticker === "SAITO") {
      return S.getInstance().getBalance();
    }
    return BigInt(0);
  }

  async initialize() {
    //
    // add ghost crypto module so Saito interface available
    //
    class SaitoCrypto extends CryptoModule {
      constructor(app) {
        super(app, "SAITO");
        this.name = "Saito";
        this.description = "Saito";
      }

      async returnBalance() {
        return parseFloat(this.app.wallet.returnBalance());
      }

      returnAddress() {
        return this.app.wallet.returnPublicKey();
      }

      returnPrivateKey() {
        return this.app.wallet.returnPrivateKey();
      }

      async sendPayment(amount, to_address, unique_hash = "") {
        let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee(to_address, amount);
        newtx = this.app.wallet.signAndEncryptTransaction(newtx);
        this.app.network.propagateTransaction(newtx);
        return newtx.transaction.sig;
      }

      async receivePayment(howMuch, from, to, timestamp) {
        const from_from = 0;
        const to_to = 0;
        if (to == this.app.wallet.returnPublicKey()) {
          for (let i = 0; i < this.app.wallet.wallet.inputs.length; i++) {
            if (this.app.wallet.wallet.inputs[i].amt === howMuch) {
              if (parseInt(this.app.wallet.wallet.inputs[i].ts) >= parseInt(timestamp)) {
                if (this.app.wallet.wallet.inputs[i].add == to) {
                  return true;
                }
              }
            }
          }
          for (let i = 0; i < this.app.wallet.wallet.outputs.length; i++) {
            if (this.app.wallet.wallet.outputs[i].amt === howMuch) {
              if (parseInt(this.app.wallet.wallet.outputs[i].ts) >= parseInt(timestamp)) {
                if (this.app.wallet.wallet.outputs[i].add == to) {
                  return true;
                }
              }
            }
          }
          return false;
        } else {
          if (from == this.app.wallet.returnPublicKey()) {
            for (let i = 0; i < this.app.wallet.wallet.outputs.length; i++) {
              //console.log("OUTPUT");
              //console.log(this.app.wallet.wallet.outputs[i]);
              if (this.app.wallet.wallet.outputs[i].amt === howMuch) {
                if (parseInt(this.app.wallet.wallet.outputs[i].ts) >= parseInt(timestamp)) {
                  if (this.app.wallet.wallet.outputs[i].add == to) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        }
      }

      returnIsActivated() {
        return true;
      }

      onIsActivated() {
        return new Promise((resolve, reject) => {
          resolve(null);
        });
      }
    }

    this.saitoCrypto = new SaitoCrypto(this.app);

    if (this.wallet.privatekey === "") {
      if (this.app.options.wallet != null) {
        /////////////
        // upgrade //
        /////////////
        if (this.app.options.wallet.version < this.wallet.version) {
          if (this.app.BROWSER == 1) {
            const tmpprivkey = this.app.options.wallet.privatekey;
            const tmppubkey = this.app.options.wallet.publickey;

            let mixin = this.app.options.mixin;
            let crypto = this.app.options.crypto;

            // specify before reset to avoid archives reset problem
            this.wallet.publickey = tmppubkey;
            this.wallet.privatekey = tmpprivkey;

            // let modules purge stuff
            this.app.modules.onWalletReset();

            // reset and save
            await this.app.storage.resetOptions();
            this.app.storage.saveOptions();

            // re-specify after reset
            this.wallet.publickey = tmppubkey;
            this.wallet.privatekey = tmpprivkey;

            this.app.options.wallet = this.wallet;

            // reset games
            this.app.options.games = [];

            // delete inputs and outputs
            this.app.options.wallet.inputs = [];
            this.app.options.wallet.outputs = [];
            this.app.options.wallet.spends = [];
            this.app.options.wallet.pending = [];
            this.app.options.wallet.balance = "0.0";
            this.app.options.wallet.version = this.wallet.version;

            // keep mixin
            this.app.options.mixin = mixin;
            this.app.options.crypto = crypto;

            this.saveWallet();

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            alert("Saito Upgrade: Wallet Reset");
          } else {
            //
            // purge old slips
            //
            this.app.options.wallet.version = this.wallet.version;

            this.app.options.wallet.inputs = [];
            this.app.options.wallet.outputs = [];
            this.app.options.wallet.pending = [];
            this.app.options.wallet.balance = "0.0";

            this.app.storage.saveOptions();
          }
        }

        this.wallet = Object.assign(this.wallet, this.app.options.wallet);
      }
    }
    ////////////////
    // new wallet //
    ////////////////
    if (this.wallet.privatekey == "") {
      await this.resetWallet();
    }
  }

  constructor(app: Saito) {
    this.app = app;

    this.inputs_hmap = new Map<string, boolean>();

    this.inputs_hmap_counter = 0;
    this.inputs_hmap_counter_limit = 10000;
    this.outputs_hmap = new Map<string, boolean>();
    this.outputs_hmap_counter = 0;
    this.outputs_hmap_counter_limit = 10000;
    this.outputs_prune_limit = 100;

    this.saitoCrypto = null;

    this.recreate_pending_transactions = 0;
  }

  //
  /**
   * Generates a new keypair for the user, resets all stored wallet info, and saves
   * the new wallet to local storage.
   */
  async resetWallet() {
    this.wallet.privatekey = this.app.crypto.generateKeys();
    this.wallet.publickey = this.app.crypto.generatePublicKey(this.wallet.privatekey);

    if (this.app.options.blockchain != undefined) {
      this.app.blockchain.resetBlockchain();
    }

    // keychain
    if (this.app.options.keys != undefined) {
      this.app.options.keys = [];
    }

    this.wallet.inputs = [];
    this.wallet.outputs = [];
    this.wallet.spends = [];
    this.wallet.pending = [];

    this.saveWallet();

    this.app.options.invites = [];
    this.app.options.games = [];
    this.app.storage.saveOptions();

    if (this.app.browser.browser_active == 1) {
      window.location.reload();
    }
  }

  /**
   * Saves the current wallet state to local storage.
   */
  saveWallet() {
    this.app.options.wallet = this.wallet;
    for (let i = 0; i < this.app.options.wallet.inputs.length; i++) {
      this.app.options.wallets.inputs[i].amt = this.app.options.wallets.inputs[i].amt.toString();
    }
    for (let i = 0; i < this.app.options.wallet.outputs.length; i++) {
      this.app.options.wallets.outputs[i].amt = this.app.options.wallets.outputs[i].amt.toString();
    }
    this.app.storage.saveOptions();
  }
}
