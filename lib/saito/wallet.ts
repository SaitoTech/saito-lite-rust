import {Saito} from "../../apps/core";

import * as  JSON from "json-bigint";
import Slip, {SlipType} from "./slip";
import Transaction, {TransactionType} from "./transaction";

/**
 * A Saito-lite wallet.
 * @param {*} app
 */
class Wallet {
    public app: Saito;
    public wallet: any;
    public inputs_hmap: any;
    public inputs_hmap_counter: any;
    public inputs_hmap_counter_limit: any;
    public outputs_hmap: any;
    public outputs_hmap_counter: any;
    public outputs_hmap_counter_limit: any;
    public outputs_prune_limit: any;
    public recreate_pending_transactions: any;
    public isSlipInPendingTransactions: any;

    constructor(app) {
        if (!(this instanceof Wallet)) {

            return new Wallet(app);

        }

        this.app = app || {};
        this.wallet = {};
        this.wallet.balance = "0";
        this.wallet.publickey = "";
        this.wallet.privatekey = "";

        this.wallet.inputs = [];		// slips available
        this.wallet.outputs = [];		// slips spenr
        this.wallet.spends = [];		// TODO -- replace with hashmap using UUID. currently array mapping inputs -> 0/1 whether spent
        this.wallet.pending = [];		// slips pending broadcast
        this.wallet.default_fee = 2;
        this.wallet.version = 4.009;

        this.wallet.preferred_crypto = "SAITO";
        this.wallet.preferred_txs = [];

        this.inputs_hmap = [];
        this.inputs_hmap_counter = 0;
        this.inputs_hmap_counter_limit = 10000;
        this.outputs_hmap = [];
        this.outputs_hmap_counter = 0;
        this.outputs_hmap_counter_limit = 10000;
        this.outputs_prune_limit = 100;

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
        this.inputs_hmap[hmi] = 1;
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

            this.inputs_hmap = [];
            this.outputs_hmap = [];
            this.inputs_hmap_counter = 0;
            this.outputs_hmap_counter = 0;

            for (let i = 0; i < this.wallet.inputs.length; i++) {
                const hmi = this.wallet.inputs[i].returnKey();
                this.inputs_hmap[hmi] = 1;
            }

            for (let i = 0; i < this.wallet.outputs.length; i++) {
                const hmi = this.wallet.outputs[i].returnKey();
                this.outputs_hmap[hmi] = 1;
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
        this.outputs_hmap[hmi] = 1;
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
        return this.inputs_hmap[hmi] == 1;

    }


    containsOutput(s) {
        const hmi = s.returnKey();
        return this.outputs_hmap[hmi] == 1;

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
        tx.transaction.to[tx.transaction.to.length - 1].type = SlipType.Normal
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
          let ptx = new saito.transaction(JSON.parse(this.wallet.pending[i]));
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

                        // reset blockchain
                        //this.app.options.blockchain.last_bid = "";
                        //this.app.options.blockchain.last_hash = "";
                        //this.app.options.blockchain.last_ts = "";

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
                        salert("Saito Upgrade: Wallet Reset");

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
                    to_slips[ii].lc = lc;						// longest-chain
                    to_slips[ii].ts = block.returnTimestamp();				// timestamp
                    to_slips[ii].from = JSON.parse(JSON.stringify(tx.transaction.from)); 	// from slips
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

                                    if ((ptx_ts + 12000000) < blk_ts) {
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
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    if (to_slips[m].type != SlipType.StakerOutput || to_slips[m].type != SlipType.StakerWithdrawal) {
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
        const lowest_block = this.app.blockchain.blockchain.last_block_id - this.app.blockchain.blockchain.genesis_period + 2;

        //
        // check pending txs to avoid slip reuse if necessary
        //
        if (this.wallet.pending.length > 0) {
            for (let i = 0; i < this.wallet.pending.length; i++) {
                const pendingtx = new Transaction(JSON.parse(this.wallet.pending[i]));
                for (let k = 0; k < pendingtx.transaction.from.length; k++) {
                    const slipIndex = pendingtx.transaction.from[k].returnKey();
                    for (let m = 0; m < this.wallet.inputs; m++) {
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
                            break
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


}

export default Wallet;


