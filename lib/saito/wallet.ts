import { Saito } from "../../apps/core";
const getUuid = require('uuid-by-string');
import saito from "./saito";

import * as JSON from "json-bigint";
import Slip, { SlipType } from "./slip";
import Transaction, { TransactionType } from "./transaction";
import Block from "./block";

const CryptoModule = require("../templates/cryptomodule");
const ModalSelectCrypto = require("./ui/modal-select-crypto/modal-select-crypto");

/**
 * A Saito-lite wallet.
 * @param {*} app
 */
export default class Wallet {
  public app: Saito;
  public wallet = {
    balance: "0",
    publickey: "",
    privatekey: "",

    preferred_crypto: "SAITO",
    preferred_txs: [],

    inputs: [], // slips available
    outputs: [], // slips spenr
    spends: [], // TODO -- replace with hashmap using UUID. currently array mapping inputs -> 0/1 whether spent
    pending: [], // slips pending broadcast
    default_fee: 2,
    version: 4.075,
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

  addInput(x) {
    //////////////
    // add slip //
    //////////////
    //
    // we keep our slip array sorted according to block_id
    // so that we can (1) spend the earliest slips first,
    // and (2) simplify deleting expired slips
    //
    let pos = this.wallet.inputs.length;
    while (pos > 0 && this.wallet.inputs[pos - 1].bid > x.bid) {
      pos--;
    }
    if (pos == -1) {
      pos = 0;
    }

    this.wallet.inputs.splice(pos, 0, x);
    this.wallet.spends.splice(pos, 0, 0);

    const hmi = x.returnKey();
    this.inputs_hmap.set(hmi, true);
    this.inputs_hmap_counter++;

    ////////////////////////
    // regenerate hashmap //
    ////////////////////////
    //
    // we want to periodically re-generate our hashmaps
    // that help us check if inputs and outputs are already
    // in our wallet for memory-management reasons and
    // to maintain reasonable accuracy.
    //
    if (this.inputs_hmap_counter > this.inputs_hmap_counter_limit) {
      this.inputs_hmap = new Map<string, boolean>();
      this.outputs_hmap = new Map<string, boolean>();
      this.inputs_hmap_counter = 0;
      this.outputs_hmap_counter = 0;

      for (let i = 0; i < this.wallet.inputs.length; i++) {
        const hmi = this.wallet.inputs[i].returnKey();
        this.inputs_hmap.set(hmi, true);
      }

      for (let i = 0; i < this.wallet.outputs.length; i++) {
        const hmi = this.wallet.outputs[i].returnKey();
        this.outputs_hmap.set(hmi, true);
      }
    }
    return;
  }

  addOutput(x) {
    //////////////
    // add slip //
    //////////////
    this.wallet.outputs.push(x);
    const hmi = x.returnKey();
    this.outputs_hmap.set(hmi, true);
    this.outputs_hmap_counter++;

    ///////////////////////
    // purge old outputs //
    ///////////////////////
    if (this.wallet.outputs.length > this.outputs_prune_limit) {
      console.log("Deleting Excessive outputs from heavy-spend wallet...");
      let outputs_excess_amount = this.wallet.outputs.length - this.outputs_prune_limit;
      outputs_excess_amount += 10;
      this.wallet.outputs.splice(0, outputs_excess_amount);
      this.outputs_hmap_counter = 0;
    }
    return;
  }

  addTransactionToPending(tx) {
    const txjson = JSON.stringify(tx.transaction);
    if (txjson.length > 100000) {
      return;
    }
    if (!this.wallet.pending.includes(txjson)) {
      this.wallet.pending.push(txjson);
      this.saveWallet();
    }
  }

  containsInput(s) {
    const hmi = s.returnKey();
    return this.inputs_hmap.get(hmi);
  }

  containsOutput(s) {
    const hmi = s.returnKey();
    return this.outputs_hmap.get(hmi);
  }

  createUnsignedTransactionWithDefaultFee(publickey = "", amount = BigInt(0)) {
    if (publickey == "") {
      publickey = this.returnPublicKey();
    }
    return this.createUnsignedTransaction(publickey, amount, BigInt(0));
  }

  createUnsignedTransaction(publickey = "", amount = BigInt(0), fee = BigInt(0), force_merge = 0) {
    // convert from human-readable to NOLAN
    amount = BigInt(amount) * BigInt(100000000);
    fee = BigInt(fee) * BigInt(100000000);

    if (publickey === "") {
      publickey = this.returnPublicKey();
    }

    const wallet_avail = this.calculateBalance();
    if (fee > wallet_avail) {
      fee = BigInt(0);
    }
    const total_fees: bigint = amount + fee;
    if (total_fees > wallet_avail) {
      console.log("Inadequate funds in wallet to create transaction w/: " + total_fees);
      throw "Inadequate SAITO to make requested transaction";
    }
    const tx = new Transaction();

    //
    // check to-address is ok -- this just keeps a server
    // that receives an invalid address from forking off
    // the main chain because it creates its own invalid
    // transaction in response. we are not preventing the
    // sending of bad transactions but good players initiating
    // good-faith transactions being maneuvered into believing
    // their own TXS must be valid as address checks are not
    // typically done on your own known-good slips.
    //
    // this is not strictly necessary, but useful for the demo
    // server during the early stages, which produces a majority of
    // blocks.
    //
    if (!this.app.crypto.isPublicKey(publickey)) {
      console.log("trying to send message to invalid address");
      throw "Invalid address " + publickey;
    }

    //
    // zero-fee transactions have fake inputs
    //
    if (total_fees == BigInt(0)) {
      tx.transaction.from = [];
      tx.transaction.from.push(new Slip(this.returnPublicKey()));
    } else {
      tx.transaction.from = this.returnAdequateInputs(total_fees);
    }
    tx.transaction.ts = new Date().getTime();
    tx.transaction.to.push(new Slip(publickey, amount));
    tx.transaction.to[tx.transaction.to.length - 1].type = SlipType.Normal;
    if (tx.transaction.from == null) {
      //
      // take a hail-mary pass and try to send this as a free transaction
      //
      tx.transaction.from = [];
      tx.transaction.from.push(new Slip(this.returnPublicKey(), BigInt(0)));
    }
    if (!tx.transaction.to) {
      //
      // take a hail-mary pass and try to send this as a free transaction
      //
      tx.transaction.to = [];
      tx.transaction.to.push(new Slip(publickey, BigInt(0)));
      //return null;
    }

    // add change input
    let total_inputs = BigInt(0);
    for (let ii = 0; ii < tx.transaction.from.length; ii++) {
      total_inputs += tx.transaction.from[ii].returnAmount();
    }

    //
    // generate change address(es)
    //
    const change_amount = total_inputs - total_fees;

    if (change_amount > BigInt(0)) {
      //
      // if we do not have many slips left, generate a few extra inputs
      //
      if (this.wallet.inputs.length < 8) {
        const change1 = change_amount / BigInt(2);
        const change2 = change_amount - change1;

        //
        // split change address
        //
        // this prevents some usability issues with APPS
        // by making sure there are usually at least 3
        // utxo available for spending.
        //
        tx.transaction.to.push(new Slip(this.returnPublicKey(), change1));
        tx.transaction.to[tx.transaction.to.length - 1].type = SlipType.Normal;
        tx.transaction.to.push(new Slip(this.returnPublicKey(), change2));
        tx.transaction.to[tx.transaction.to.length - 1].type = SlipType.Normal;
      } else {
        //
        // single change address
        //
        tx.transaction.to.push(new Slip(this.returnPublicKey(), change_amount));
        tx.transaction.to[tx.transaction.to.length - 1].type = SlipType.Normal;
      }
    }

    /**** DISABLED RUST PORT

         //
         // if our wallet is filling up with slips, merge a few
         //
         //if (this.wallet.inputs.length > 200 || force_merge > 0) {
    if (this.wallet.inputs.length > 30 || force_merge > 0) {

console.log("---------------------");
console.log("Merging Wallet Slips!");
console.log("---------------------");

      let slips_to_merge = 7;
      if (force_merge > 7) { slips_to_merge = force_merge; }
      let slips_merged = 0;
      let output_amount = BigInt(0);
      let lowest_block = this.app.blockchain.last_bid - this.app.blockchain.genesis_period + 2;

      //
      // check pending txs to avoid slip reuse
      //
      if (this.wallet.pending.length > 0) {
        for (let i = 0; i < this.wallet.pending.length; i++) {
          let ptx = new saito.default.transaction(JSON.parse(this.wallet.pending[i]));
          for (let k = 0; k < ptx.transaction.from.length; k++) {
            let slipIndex = ptx.transaction.from[k].returnSignatureSource();
            for (let m = 0; m < this.wallet.inputs; m++) {
              let thisSlipIndex = this.wallet.inputs[m].returnSignatureSource();
              if (thisSlipIndex === slipIndex) {
                while (this.wallet.spends.length < m) {
                  this.wallet.spends.push(0);
                }
                this.wallet.spends[m] = 1;
              }
            }
          }
        }
      }

      for (let i = 0; slips_merged < slips_to_merge && i < this.wallet.inputs.length; i++) {
        if (this.wallet.spends[i] == 0 || i >= this.wallet.spends.length) {
          var slip = this.wallet.inputs[i];
          if (slip.lc == 1 && slip.bid >= lowest_block) {
            if (this.app.mempool.transactions_inputs_hmap[slip.returnSignatureSource()] != 1) {
              this.wallet.spends[i] = 1;

              slips_merged++;
              output_amount = output_amount.plus(BigInt(slip.amt));

              tx.transaction.from.push(slip);

            }
          }
        }
      }

      // add new output
      tx.transaction.to.push(new Slip(this.returnPublicKey(), output_amount.toFixed(8)));
      tx.transaction.to[tx.transaction.to.length-1].type = 0;

    }

         ****/

    //
    // save to avoid creating problems on reload
    //
    this.saveWallet();
    return tx;
  }

  initialize() {
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
      async sendPayment(amount, to_address, unique_hash="") {
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

            // specify before reset to avoid archives reset problem
            this.wallet.publickey = tmppubkey;
            this.wallet.privatekey = tmpprivkey;

            // let modules purge stuff
            this.app.modules.onWalletReset();

            // reset and save
            this.app.storage.resetOptions();
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
      this.resetWallet();
    }
  }

  isSlipValid(slip, index) {
    const isSlipSpent = this.wallet.spends[index];
    const isSlipLC = slip.lc == 1;
    const isSlipGtLVB = slip.bid >= this.app.blockchain.returnLowestSpendableBlock();
    const isSlipinTX = this.app.mempool.transactions_inputs_hmap[slip.returnKey()] != 1;
    const valid = !isSlipSpent && isSlipLC && isSlipGtLVB && isSlipinTX;
    return valid;
  }

  onChainReorganization(block, lc) {
    const block_id = block.returnId();
    const block_hash = block.returnHash();

    //
    // flag inputs as on/off-chain
    //
    for (let m = this.wallet.inputs.length - 1; m >= 0; m--) {
      if (this.wallet.inputs[m].bid == block_id && this.wallet.inputs[m].bsh === block_hash) {
        this.wallet.inputs[m].lc = lc;
      } else {
        if (this.wallet.inputs[m].bid < block_id) {
          break;
        }
      }
    }

    if (lc) {
      //
      // refresh inputs (allow respending)
      //
      if (block_id == 0) {
        for (let i = 0; i < this.wallet.inputs.length; i++) {
          if (this.isSlipInPendingTransactions(this.wallet.inputs[i]) == false) {
            this.wallet.spends[i] = 0;
          }
        }
      } else {
        const target_block_id = this.app.blockchain.returnLatestBlockId() - block_id;
        for (let i = 0; i < this.wallet.inputs.length; i++) {
          if (this.wallet.inputs[i].bid <= target_block_id) {
            if (this.isSlipInPendingTransactions(this.wallet.inputs[i]) == false) {
              this.wallet.spends[i] = 0;
            }
          }
        }
      }

      //
      // purge now-unspendable inputs
      //
      const gid = this.app.blockchain.blockchain.genesis_block_id;
      for (let m = this.wallet.inputs.length - 1; m >= 0; m--) {
        if (this.wallet.inputs[m].bid < gid) {
          this.wallet.inputs.splice(m, 1);
          this.wallet.spends.splice(m, 1);
        }
      }
      for (let m = this.wallet.outputs.length - 1; m >= 0; m--) {
        if (this.wallet.outputs[m].bid < gid) {
          this.wallet.outputs.splice(m, 1);
        }
      }

      //
      // if new LC, add transactions to inputs if not exist
      //
      for (let i = 0; i < block.transactions.length; i++) {
        const tx = block.transactions[i];
        const slips = tx.returnSlipsToAndFrom(this.returnPublicKey());
        const to_slips = [];
        const from_slips = [];
        for (let m = 0; m < slips.to.length; m++) {
          to_slips.push(slips.to[m].clone());
        }
        for (let m = 0; m < slips.from.length; m++) {
          from_slips.push(slips.from[m].clone());
        }

        //
        // update slips prior to insert
        //
        for (let ii = 0; ii < to_slips.length; ii++) {
          to_slips[ii].uuid = block.returnHash();
          to_slips[ii].lc = lc; // longest-chain
          to_slips[ii].ts = block.returnTimestamp(); // timestamp
          to_slips[ii].from = JSON.parse(JSON.stringify(tx.transaction.from)); // from slips
        }

        for (let ii = 0; ii < from_slips.length; ii++) {
          from_slips[ii].ts = block.returnTimestamp();
        }

        //
        // any txs in pending should be checked to see if
        // we can remove them now that we have received
        // a transaction that might be it....
        //
        let removed_pending_slips = 0;

        if (this.wallet.pending.length > 0) {
          for (let i = 0; i < this.wallet.pending.length; i++) {
            const ptx = new Transaction(JSON.parse(this.wallet.pending[i]));

            if (this.wallet.pending[i].indexOf(tx.transaction.sig) > 0) {
              this.wallet.pending.splice(i, 1);
              i--;
              removed_pending_slips = 1;
            } else {
              if (ptx.transaction.type == TransactionType.GoldenTicket) {
                this.wallet.pending.splice(i, 1);
                this.unspendInputSlips(ptx);
                i--;
                removed_pending_slips = 1;
              } else {
                //
                // 10% chance of deletion, to prevent wallets killing us
                //
                if (Math.random() <= 0.1) {
                  const ptx_ts = ptx.transaction.ts;
                  const blk_ts = block.block.ts;

                  if (ptx_ts + 12000000 < blk_ts) {
                    this.wallet.pending.splice(i, 1);
                    this.unspendInputSlips(ptx);
                    removed_pending_slips = 1;
                    i--;
                  }
                }
              }
            }
          }
        }

        if (removed_pending_slips == 1) {
          this.saveWallet();
        }

        //
        // inbound payments
        //
        if (to_slips.length > 0) {
          for (let m = 0; m < to_slips.length; m++) {
            if (to_slips[m].isNonZeroAmount()) {
              if (!this.containsInput(to_slips[m])) {
                if (!this.containsOutput(to_slips[m])) {
                  if (
                    to_slips[m].type != SlipType.StakerOutput ||
                    (to_slips[m].type != SlipType.StakerWithdrawalPending &&
                      to_slips[m].type != SlipType.StakerWithdrawalStaking)
                  ) {
                    this.addInput(to_slips[m]);
                  }
                }
              } else {
                const key = to_slips[m].returnKey();
                for (let n = this.wallet.inputs.length - 1; n >= 0; n--) {
                  if (this.wallet.inputs[n].returnKey() === key) {
                    this.wallet.inputs[n].lc = lc;
                  }
                }
              }
            }
          }
        }

        //
        // outbound payments
        //
        if (from_slips.length > 0) {
          for (let m = 0; m < from_slips.length; m++) {
            const s = from_slips[m];
            for (let c = 0; c < this.wallet.inputs.length; c++) {
              const qs = this.wallet.inputs[c];
              if (
                s.uuid == qs.uuid &&
                s.sid == qs.sid &&
                s.amt.toString() == qs.amt.toString() &&
                s.add == qs.add
              ) {
                if (!this.containsOutput(s)) {
                  this.addOutput(s);
                }
                this.wallet.inputs.splice(c, 1);
                this.wallet.spends.splice(c, 1);
                c = this.wallet.inputs.length + 2;
              }
            }
          }
        }
      }
    } // lc = 1

    //
    // save wallet
    //
    this.updateBalance();
    this.app.options.wallet = this.wallet;
    this.app.storage.saveOptions();
  }

  returnAdequateInputs(amt) {
    const utxiset = [];
    let value = BigInt(0);
    const bigamt = BigInt(amt) * BigInt(100_000_000);

    //
    // this adds a 1 block buffer so that inputs are valid in the future block included
    //
    const lowest_block =
      this.app.blockchain.blockchain.last_block_id -
      this.app.blockchain.blockchain.genesis_period +
      2;

    //
    // check pending txs to avoid slip reuse if necessary
    //
    if (this.wallet.pending.length > 0) {
      for (let i = 0; i < this.wallet.pending.length; i++) {
        const pendingtx = new Transaction(JSON.parse(this.wallet.pending[i]));
        for (let k = 0; k < pendingtx.transaction.from.length; k++) {
          const slipIndex = pendingtx.transaction.from[k].returnKey();
          for (let m = 0; m < this.wallet.inputs.length; m++) {
            const thisSlipIndex = this.wallet.inputs[m].returnKey();
            // if the input in the wallet is already in a pending tx...
            // then set spends[m] to 1
            if (thisSlipIndex === slipIndex) {
              while (this.wallet.spends.length < m) {
                this.wallet.spends.push(0);
              }
              this.wallet.spends[m] = 1;
            }
          }
        }
      }
    }
    let hasAdequateInputs = false;
    const slipIndexes = [];
    for (let i = 0; i < this.wallet.inputs.length; i++) {
      if (this.wallet.spends[i] == 0 || i >= this.wallet.spends.length) {
        const slip = this.wallet.inputs[i];
        if (slip.lc == 1 && slip.bid >= lowest_block) {
          if (this.app.mempool.transactions_inputs_hmap[slip.returnKey()] != 1) {
            slipIndexes.push(i);
            utxiset.push(slip);
            value += slip.returnAmount();
            if (value >= bigamt) {
              hasAdequateInputs = true;
              break;
            }
          }
        }
      }
    }
    if (hasAdequateInputs) {
      for (let i = 0; i < slipIndexes.length; i++) {
        this.wallet.spends[slipIndexes[i]] = 1;
      }
      return utxiset;
    } else {
      return null;
    }
  }

  returnPublicKey() {
    return this.wallet.publickey;
  }

  returnPrivateKey() {
    return this.wallet.privatekey;
  }

  returnBalance(ticker = "SAITO") {
    if (ticker === "SAITO") {
      let b = BigInt(0);
      this.wallet.inputs.forEach((input, index) => {
        if (this.isSlipValid(input, index)) {
          b += input.returnAmount();
        }
      });
      return b;
    }
    return "0.0";
  }

  /**
   * Generates a new keypair for the user, resets all stored wallet info, and saves
   * the new wallet to local storage.
   */
  async resetWallet() {
    this.wallet.privatekey = this.app.crypto.generateKeys();
    this.wallet.publickey = this.app.crypto.returnPublicKey(this.wallet.privatekey);

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

  /**
   * Sign a transactions and attach the sig to the transation
   * @param {Transaction}
   * @return {Transaction}
   */
  signTransaction(tx) {
    if (tx == null) {
      return null;
    }

    //
    // convert tx.msg to base64 tx.transaction.m
    //
    try {
      tx.sign(this.app);
    } catch (err) {
      console.error("####################");
      console.error("### OVERSIZED TX ###");
      console.error("###   -revert-   ###");
      console.error("####################");
      console.error(err);
      tx.msg = {};
      return tx;
    }

    return tx;
  }

  //
  // Sign an arbitrary message with wallet keypair
  //
  // TODO -- this can be replaced with direct calls to crypto.signMessage() etc., here for backwards compatibility
  //
  signMessage(msg) {
    return this.app.crypto.signMessage(msg, this.returnPrivateKey());
  }

  /**
   * If the to field of the transaction contains a pubkey which has previously negotiated a diffie-hellman
   * key exchange, encrypt the message part of message, attach it to the transaction, and resign the transaction
   * @param {Transaction}
   * @return {Transaction}
   */
  signAndEncryptTransaction(tx) {
    if (tx == null) {
      return null;
    }

    //
    // convert tx.msg to base64 tx.transaction.ms
    //
    // if the transaction is of excessive length, we cut the message and
    // continue blank. so be careful kids as there are some hardcoded
    // limits in NodeJS!
    //
    try {
      if (this.app.keys.hasSharedSecret(tx.transaction.to[0].add)) {
        tx.msg = this.app.keys.encryptMessage(tx.transaction.to[0].add, tx.msg);
      }
      // nov 30 - set in tx.sign() now
      tx.transaction.m = this.app.crypto.stringToBase64(JSON.stringify(tx.msg));
    } catch (err) {
      console.log("####################");
      console.log("### OVERSIZED TX ###");
      console.log("###   -revert-   ###");
      console.log("####################");
      console.log(err);
      tx.msg = {};
    }

    tx.sign(this.app);

    return tx;
  }

  unspendInputSlips(tmptx = null) {
    if (tmptx == null) {
      return;
    }
    for (let i = 0; i < tmptx.transaction.from.length; i++) {
      const fsidx = tmptx.transaction.from[i].returnKey();
      for (let z = 0; z < this.wallet.inputs.length; z++) {
        if (fsidx == this.wallet.inputs[z].returnKey()) {
          this.wallet.spends[z] = 0;
        }
      }
    }
  }

  calculateBalance(): bigint {
    let bal = BigInt(0);
    this.wallet.inputs.forEach((input, index) => {
      if (this.isSlipValid(input, index)) {
        bal += input.returnAmount();
      }
    });
    return bal;
  }

  updateBalance() {
    const bal = this.calculateBalance();
    const ebal = this.wallet.balance;
    this.wallet.balance = bal.toString();
    if (this.wallet.balance !== ebal) {
      this.app.connection.emit("update_balance", this);
    }
  }

  /////////////////////////
  // WEB3 CRYPTO MODULES //
  /////////////////////////

  returnInstalledCryptos() {
    const cryptoModules = this.app.modules.returnModulesBySubType(CryptoModule);
    if (this.saitoCrypto !== null) {
      cryptoModules.push(this.saitoCrypto);
    }
    return cryptoModules;
  }

  returnActivatedCryptos() {
    const allMods = this.returnInstalledCryptos();
    const activeMods = [];
    for (let i = 0; i < allMods.length; i++) {
      if (allMods[i].returnIsActivated()) {
        activeMods.push(allMods[i]);
      }
    }
    return activeMods;
  }

  returnCryptoModuleByTicker(ticker) {
    const mods = this.returnInstalledCryptos();
    for (let i = 0; i < mods.length; i++) {
      if (mods[i].ticker === ticker) {
        return mods[i];
      }
    }
    throw "Module Not Found: " + ticker;
  }

  setPreferredCrypto(ticker, show_overlay = 0) {
    let can_we_do_this = 0;
    const mods = this.returnInstalledCryptos();
    let cryptomod = null;
    for (let i = 0; i < mods.length; i++) {
      if (mods[i].ticker === ticker) {
console.log("setting cryptomod");
        cryptomod = mods[i];
        can_we_do_this = 1;
      }
    }

console.log("cryptomod.ticker: " + cryptomod.ticker);

    if (ticker == "SAITO") {
      can_we_do_this = 1;
    }

    if (can_we_do_this == 1) {
      this.wallet.preferred_crypto = ticker;
console.log("Activating cryptomod: " + cryptomod.ticker);
      cryptomod.activate();
      this.saveWallet();
console.log("emitting set preferred crypto event");
      this.app.connection.emit("set_preferred_crypto", ticker);
    }

    if (cryptomod != null && show_overlay == 1) {
      if (cryptomod.renderModalSelectCrypto() != null) {
        const modal_select_crypto = new ModalSelectCrypto(this.app, cryptomod);
        modal_select_crypto.render(this.app, cryptomod);
        modal_select_crypto.attachEvents(this.app, cryptomod);
      }
    }

    return;
  }

  returnPreferredCrypto() {
    try {
      return this.returnCryptoModuleByTicker(this.wallet.preferred_crypto);
    } catch (err) {
      if (err.startsWith("Module Not Found:")) {
        this.setPreferredCrypto("SAITO");
        return this.returnCryptoModuleByTicker(this.wallet.preferred_crypto);
      } else {
        throw err;
      }
    }
  }
  returnPreferredCryptoTicker() {
    try {
      const pc = this.returnPreferredCrypto();
      if (pc != null && pc != undefined) {
        return pc.ticker;
      }
    } catch (err) {
      return "";
    }
  }

  returnCryptoAddressByTicker(ticker = "SAITO") {
    try {
      if (ticker === "SAITO") {
        return this.returnPublicKey();
      } else {
        const cmod = this.returnCryptoModuleByTicker(ticker);
        return cmod.returnAddress();
      }
    } catch (err) {
      console.error(err);
    }
    return "";
  }

  async returnPreferredCryptoBalances(addresses = [], mycallback = null, ticker = "") {
    if (ticker == "") {
      ticker = this.wallet.preferred_crypto;
    }
    const cryptomod = this.returnCryptoModuleByTicker(ticker);
    const returnObj = [];
    const balancePromises = [];
    for (let i = 0; i < addresses.length; i++) {
      balancePromises.push(cryptomod.returnBalance(addresses[i]));
    }
    const balances = await Promise.all(balancePromises);
    for (let i = 0; i < addresses.length; i++) {
      returnObj.push({ address: addresses[i], balance: balances[i] });
    }
    if (mycallback != null) {
      mycallback(returnObj);
    }
    return returnObj;
  }
  /*** courtesy function to simplify balance checks for a single address w/ ticker ***/
  async checkBalance(address, ticker) {
    const robj = await this.returnPreferredCryptoBalances([address], null, ticker);
    if (robj.length < 1) {
      return 0;
    }
    if (robj[0].balance) {
      return robj[0].balance;
    }
    return 0;
  }
  async returnPreferredCryptoBalance() {
    const cryptomod = this.returnPreferredCrypto();
    return await this.checkBalance(cryptomod.returnAddress(), cryptomod.ticker);
  }
  /**
   * Sends payments to the addresses provided if this user is the corresponding
   * sender. Will not send if similar payment was found after the given timestamp.
   * @param {Array} senders - Array of addresses
   * @param {Array} receivers - Array of addresses
   * @param {Array} amounts - Array of amounts to send
   * @param {Int} timestamp - Timestamp of time after which payment should be made
   * @param {Function} mycallback - ({hash: {String}}) -> {...}
   * @param {String} ticker - Ticker of install crypto module
   */
  async sendPayment(senders = [], receivers = [], amounts = [], timestamp, unique_hash="", mycallback=null, ticker) {
console.log("wallet sendPayment");
    // validate inputs
    if (senders.length != receivers.length || senders.length != amounts.length) {
      console.log("Lengths of senders, receivers, and amounts must be the same");
      //mycallback({err: "Lengths of senders, receivers, and amounts must be the same"});
      return;
    }
    if (senders.length !== 1) {
      // We have no code which exercises multiple senders/receivers so can't implement it yet.
      console.log("sendPayment ERROR: Only supports one transaction");
      //mycallback({err: "Only supports one transaction"});
      return;
    }
    // only send if hasn't been sent before
console.log("does preferred crypto transaction exist: " + this.doesPreferredCryptoTransactionExist(senders, receivers, amounts, unique_hash, ticker));
console.log("unique hash: " + unique_hash);
console.log("uuid: " + getUuid(unique_hash));

    if (!this.doesPreferredCryptoTransactionExist(senders, receivers, amounts, unique_hash, ticker)) {
      const cryptomod = this.returnCryptoModuleByTicker(ticker);
      for (let i = 0; i < senders.length; i++) {
console.log("senders and returnAddress: " + senders[i] + " -- " + cryptomod.returnAddress());
        if (senders[i] === cryptomod.returnAddress()) {
          // Need to save before we await, otherwise there is a race condition
          this.savePreferredCryptoTransaction(senders, receivers, amounts, unique_hash, ticker);
          try {
            let unique_tx_hash = this.generatePreferredCryptoTransactionHash(senders, receivers, amounts, unique_hash, ticker);
console.log("wallet -> cryptomod - sendPayment: " + unique_tx_hash);
console.log("unique_hash: " + unique_tx_hash);
console.log("senders: " + JSON.stringify(senders));
console.log("receivers: " + JSON.stringify(receivers));
console.log("amounts: " + JSON.stringify(amounts));
console.log("timestamp: " + timestamp);
console.log("ticker: " + ticker);
            const hash = await cryptomod.sendPayment(amounts[i], receivers[i], unique_tx_hash);
console.log("wallet -> cryptomod - sendPayment - done");
	    //
	    // hash is "" if unsuccessful, trace_id if successful
	    //
	    if (hash === "") {
              this.deletePreferredCryptoTransaction(senders, receivers, amounts, unique_hash, ticker);
            }

	    if (mycallback) {
              mycallback({ hash: hash });
	    }
console.log("and after the callback");
            return;
          } catch (err) {
            // it failed, delete the transaction
            console.log("sendPayment ERROR: payment failed....\n" + err);
            this.deletePreferredCryptoTransaction(senders, receivers, amounts, unique_hash, ticker);
            //mycallback({err: err});
            return;
          }
        }
      }
    } else {
      console.log("sendPayment ERROR: already sent");
      //mycallback({err: "already sent"});
    }
  }
  /**
   * Checks that a payment has been received if the current user is the receiver.
   * @param {Array} senders - Array of addresses
   * @param {Array} receivers - Array of addresses
   * @param {Array} amounts - Array of amounts to send
   * @param {Int} timestamp - Timestamp of time after which payment should be made
   * @param {Function} mycallback - (Array of {address: {String}, balance: {Int}}) -> {...}
   * @param {String} ticker - Ticker of install crypto module
   * @param {Int} tries - (default: 36) Number of tries to query the underlying crypto API before giving up. Sending -1 will cause infinite retries.
   * @param {Int} pollWaitTime - (default: 5000) Amount of time to wait between tries
   * @return {Array} Array of {address: {String}, balance: {Int}}
   */
  async receivePayment(
    senders = [],
    receivers = [],
    amounts = [],
    timestamp,
    unique_hash = "",
    mycallback,
    ticker,
    tries = 36,
    pollWaitTime = 5000
  ) {
console.log("wallet receivePayment");
    let unique_tx_hash = this.generatePreferredCryptoTransactionHash(senders, receivers, amounts, unique_hash, ticker);
console.log("wallet -> cryptomod - sendPayment: " + unique_tx_hash);
console.log("unique_hash: " + unique_tx_hash);
console.log("senders: " + JSON.stringify(senders));
console.log("receivers: " + JSON.stringify(receivers));
console.log("amounts: " + JSON.stringify(amounts));
console.log("timestamp: " + timestamp);
console.log("ticker: " + ticker);

    if (senders.length != receivers.length || senders.length != amounts.length) {
      console.log("receivePayment ERROR. Lengths of senders, receivers, and amounts must be the same");
      return;
    }
    if (senders.length !== 1) {
      console.log("receivePayment ERROR. Only supports one transaction");
      return;
    }

    //
    // if payment already received, return
    //
    if (this.doesPreferredCryptoTransactionExist(senders, receivers, amounts, unique_hash, ticker)) {
      mycallback();
console.log("our preferred crypto transaction exists!");
      return 1;
    }

    const cryptomod = this.returnCryptoModuleByTicker(ticker);
    await cryptomod.onIsActivated();

    //
    // create a function we can loop through to check if the payment has come in....
    //
    const check_payment_function = async () => {
console.log("wallet -> cryptmod receivePayment");
      return await cryptomod.receivePayment(amounts[0], senders[0], receivers[0], timestamp - 3, unique_tx_hash); // subtract 3 seconds in case system time is slightly off
    };

    const poll_check_payment_function = async () => {
      console.log("poll_check_payment_function remaining tries: " + tries);
      let result = null;
      try {
        result = await check_payment_function();
      } catch (err) {
        console.log("receivePayment ERROR." + err);
        return;
        //mycallback({err: err});
      }
      did_complete_payment(result);
    };

    const did_complete_payment = (result) => {
      if (result) {
        // The transaction was found, we're done.
        console.log("TRANSACTION FOUND");
        this.savePreferredCryptoTransaction(senders, receivers, amounts, unique_hash, ticker);
        mycallback(result);
      } else {
        // The transaction was not found.
        tries--;
        // This is === rather than < because sending -1 is a way to do infinite polling
        if (tries != 0) {
          setTimeout(() => {
            poll_check_payment_function();
          }, pollWaitTime);
        } else {
          // There is no way to handle errors with the interface of receivePayment as it's been designed.
          // We will swallow this error and log it to the console and return.
          // Do not delete this console.log, at least maybe the engineer who is maintaining this needs
          // some hope of figuring out why the game isn't progressing.
          console.log(
            "Did not receive payment after " + (pollWaitTime * tries) / 1000 + " seconds"
          );
          return;
          // mycallback({err: "Did not receive payment after " + ((pollWaitTime * tries)/1000) + " seconds"});
        }
      }
    };
    poll_check_payment_function();
    //});
  }

  generatePreferredCryptoTransactionHash(senders = [], receivers = [], amounts, unique_hash, ticker) {
    return this.app.crypto.hash(
      JSON.stringify(senders) +
      JSON.stringify(receivers) +
      JSON.stringify(amounts) +
      unique_hash +
      ticker
    );
  }
  savePreferredCryptoTransaction(senders = [], receivers = [], amounts, unique_hash, ticker) {
    let sig = this.generatePreferredCryptoTransactionHash(senders, receivers, amounts, unique_hash, ticker);
    this.wallet.preferred_txs.push({
      sig: sig,
      ts: new Date().getTime(),
    });
    for (let i = this.wallet.preferred_txs.length - 1; i >= 0; i--) {
      if (this.wallet.preferred_txs[i].ts < new Date().getTime() - 100000000) {
        this.wallet.preferred_txs.splice(i, 1);
      }
    }

    this.saveWallet();

    return 1;
  }

  doesPreferredCryptoTransactionExist(senders = [], receivers = [], amounts, unique_hash, ticker) {
    const sig = this.generatePreferredCryptoTransactionHash(senders, receivers, amounts, unique_hash, ticker);
    for (let i = 0; i < this.wallet.preferred_txs.length; i++) {
      if (this.wallet.preferred_txs[i].sig === sig) {
        return 1;
      }
    }
    return 0;
  }

  deletePreferredCryptoTransaction(senders = [], receivers = [], amounts, unique_hash, ticker) {
    const sig = this.generatePreferredCryptoTransactionHash(senders, receivers, amounts, unique_hash, ticker);
    for (let i = 0; i < this.wallet.preferred_txs.length; i++) {
      if (this.wallet.preferred_txs[i].sig === sig) {
        this.wallet.preferred_txs.splice(i, 1);
      }
    }
  }

  private isSlipInPendingTransactions(input: Slip): boolean {
    for (let i = 0; i < this.wallet.pending.length; i++) {
      let ptx = new saito.transaction(JSON.parse(this.wallet.pending[i]));
      for (let ii = 0; ii < ptx.transaction.from.length; ii++) {
        if (input.returnKey() === ptx.transaction.from[ii].returnKey()) {
          return true;
        }
      }
    }
    return false;
  }

  /////////////////////
  // END WEB3 CRYPTO //
  /////////////////////

  //////////////////
  // UI Functions //
  //////////////////

  /**
   * Serialized the user's wallet to JSON and downloads it to their local machine
   */
  async backupWallet() {
    try {
      if (this.app.BROWSER == 1) {
        let content = JSON.stringify(this.app.options);
        let pom = document.createElement("a");
        pom.setAttribute("type", "hidden");
        pom.setAttribute("href", "data:application/json;utf-8," + encodeURIComponent(content));
        pom.setAttribute("download", "saito.wallet.json");
        document.body.appendChild(pom);
        pom.click();
        pom.remove();
      }
    } catch (err) {
      console.log("Error backing-up wallet: " + err);
    }
  }

  async restoreWallet(file) {
    let wallet_reader = new FileReader();
    wallet_reader.readAsBinaryString(file);
    wallet_reader.onloadend = () => {
      let decryption_secret = "";
      let decrypted_wallet = wallet_reader.result.toString();
      try {
        let wobj = JSON.parse(decrypted_wallet);
        wobj.wallet.version = this.wallet.version;
        wobj.wallet.inputs = [];
        wobj.wallet.outputs = [];
        wobj.wallet.spends = [];
        wobj.games = [];
        wobj.gameprefs = {};
        this.app.options = wobj;

        this.app.blockchain.resetBlockchain();

        this.app.modules.returnModule("Arcade").onResetWallet();
        this.app.storage.saveOptions();

        alert("Restoration Complete ... click to reload Saito");
        window.location.reload();
      } catch (err) {
        if (err.name == "SyntaxError") {
          alert("Error reading wallet file. Did you upload the correct file?");
        } else if (false) {
          // put this back when we support encrypting wallet backups again...
          alert("Error decrypting wallet file. Password incorrect");
        } else {
          alert("Unknown error<br/>" + err);
        }
      }
    };
  }

  deleteBlock(block: Block) {
    // TODO : @david
  }
}
