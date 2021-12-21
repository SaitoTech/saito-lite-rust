"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = exports.HOP_SIZE = exports.SLIP_SIZE = exports.TRANSACTION_SIZE = void 0;
var saito_1 = __importDefault(require("./saito"));
var JSON = __importStar(require("json-bigint"));
var slip_1 = __importStar(require("./slip"));
exports.TRANSACTION_SIZE = 89;
exports.SLIP_SIZE = 75;
exports.HOP_SIZE = 130;
var TransactionType;
(function (TransactionType) {
    TransactionType[TransactionType["Normal"] = 0] = "Normal";
    TransactionType[TransactionType["Fee"] = 1] = "Fee";
    TransactionType[TransactionType["GoldenTicket"] = 2] = "GoldenTicket";
    TransactionType[TransactionType["ATR"] = 3] = "ATR";
    TransactionType[TransactionType["Vip"] = 4] = "Vip";
    TransactionType[TransactionType["StakerDeposit"] = 5] = "StakerDeposit";
    TransactionType[TransactionType["StakerWithdrawal"] = 6] = "StakerWithdrawal";
    TransactionType[TransactionType["Other"] = 7] = "Other";
    TransactionType[TransactionType["Issuance"] = 8] = "Issuance";
    TransactionType[TransactionType["SPV"] = 9] = "SPV";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var Transaction = /** @class */ (function () {
    function Transaction(jsonobj) {
        if (jsonobj === void 0) { jsonobj = null; }
        /////////////////////////
        // consensus variables //
        /////////////////////////
        this.transaction = {};
        this.transaction.to = [];
        this.transaction.from = [];
        this.transaction.ts = 0;
        this.transaction.sig = "";
        this.transaction.path = [];
        this.transaction.r = 1; // replaces
        this.transaction.type = TransactionType.Normal;
        this.transaction.m = "";
        this.fees_total = BigInt(0);
        this.work_available_to_me = BigInt(0);
        this.work_available_to_creator = BigInt(0);
        this.work_cumulative = BigInt(0);
        //
        // cumulative fees. this is calculated when
        // we process the block so that we can quickly
        // select the winning transaction based on the
        // golden ticket. it indicates how much this
        // transaction carries in work in the overall
        // weight of the block. we use this to find
        // the winning node in the block for the
        // routing payment. i.e. this measures the
        // cumulative weight of the usable fees that
        // are behind the transactions.
        this.msg = {};
        this.dmsg = "";
        this.size = 0;
        this.is_valid = 1;
        if (jsonobj != null) {
            this.transaction = jsonobj;
            if (this.transaction.type === TransactionType.Normal) {
                try {
                    var reconstruct = this.base64ToString(Buffer.from(this.transaction.m).toString());
                    this.msg = JSON.parse(reconstruct);
                }
                catch (err) {
                    console.error(err);
                }
            }
            for (var i = 0; i < this.transaction.from.length; i++) {
                var fslip = this.transaction.from[i];
                var fslipobj = new slip_1.default(fslip.add, fslip.amt, fslip.type, fslip.uuid, fslip.sid, fslip.payout, fslip.lc);
                this.transaction.from[i] = fslipobj;
            }
            for (var i = 0; i < this.transaction.to.length; i++) {
                var fslip = this.transaction.to[i];
                var fslipobj = new slip_1.default(fslip.add, fslip.amt, fslip.type, fslip.uuid, fslip.sid, fslip.payout, fslip.lc);
                this.transaction.to[i] = fslipobj;
            }
        }
        return this;
    }
    Transaction.prototype.addInput = function (slip) {
        this.transaction.from.push(slip);
    };
    Transaction.prototype.addOutput = function (slip) {
        this.transaction.fto.push(slip);
    };
    Transaction.prototype.clone = function () {
        var tx = new Transaction();
        tx.transaction.from = [];
        tx.transaction.to = [];
        for (var i = 0; i < this.transaction.from.length; i++) {
            tx.transaction.from.push(this.transaction.from[i].clone());
        }
        for (var i = 0; i < this.transaction.to.length; i++) {
            tx.transaction.to.push(this.transaction.to[i].clone());
        }
        tx.transaction.ts = this.transaction.ts;
        tx.transaction.sig = this.transaction.sig;
        tx.transaction.path = [];
        for (var i = 0; i < this.transaction.path.length; i++) {
            tx.transaction.path.push(this.transaction.path[i].clone());
        }
        tx.transaction.r = this.transaction.r;
        tx.transaction.type = this.transaction.type;
        tx.transaction.m = this.transaction.m;
        return tx;
    };
    Transaction.prototype.decryptMessage = function (app) {
        if (this.transaction.from[0].add !== app.wallet.returnPublicKey()) {
            try {
                var parsed_msg = this.msg;
                this.dmsg = app.keys.decryptMessage(this.transaction.from[0].add, parsed_msg);
            }
            catch (e) {
                console.log("ERROR: " + e);
            }
            return;
        }
        try {
            this.dmsg = app.keys.decryptMessage(this.transaction.to[0].add, this.msg);
        }
        catch (e) {
            this.dmsg = "";
        }
        return;
    };
    /**
     * Deserialize Transaction
     * @param {array} buffer - raw bytes, perhaps an entire block
     * @param {number} start_of_transaction_data - where in the buffer does the tx data begin
     * @returns {Transaction}
     */
    Transaction.prototype.deserialize = function (app, buffer, start_of_transaction_data) {
        var inputs_len = app.binary.u32FromBytes(buffer.slice(start_of_transaction_data, start_of_transaction_data + 4));
        var outputs_len = app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 4, start_of_transaction_data + 8));
        var message_len = app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 8, start_of_transaction_data + 12));
        var path_len = app.binary.u32FromBytes(buffer.slice(start_of_transaction_data + 12, start_of_transaction_data + 16));
        var signature = app.crypto.stringToHex(buffer.slice(start_of_transaction_data + 16, start_of_transaction_data + 80));
        var timestamp = app.binary.u64FromBytes(buffer.slice(start_of_transaction_data + 80, start_of_transaction_data + 88));
        var transaction_type = buffer[start_of_transaction_data + 88];
        var start_of_inputs = start_of_transaction_data + exports.TRANSACTION_SIZE;
        var start_of_outputs = start_of_inputs + (inputs_len * exports.SLIP_SIZE);
        var start_of_message = start_of_outputs + (outputs_len * exports.SLIP_SIZE);
        var start_of_path = start_of_message + message_len;
        var inputs = [];
        for (var i = 0; i < inputs_len; i++) {
            var start_of_slip = start_of_inputs + (i * exports.SLIP_SIZE);
            var end_of_slip = start_of_slip + exports.SLIP_SIZE;
            var input = new slip_1.default();
            input.deserialize(app, buffer.slice(start_of_slip, end_of_slip));
            inputs.push(input);
        }
        var outputs = [];
        for (var i = 0; i < outputs_len; i++) {
            var start_of_slip = start_of_outputs + (i * exports.SLIP_SIZE);
            var end_of_slip = start_of_slip + exports.SLIP_SIZE;
            var output = new slip_1.default();
            output.deserialize(app, buffer.slice(start_of_slip, end_of_slip));
            outputs.push(output);
        }
        var message = buffer.slice(start_of_message, start_of_message + message_len);
        var path = [];
        for (var i = 0; i < path_len; i++) {
            var start_of_data = start_of_path + (i * exports.HOP_SIZE);
            var end_of_data = start_of_data + exports.HOP_SIZE;
            var hop = new saito_1.default.hop();
            hop.deserialize(app, buffer.slice(start_of_data, end_of_data));
            path.push(hop);
        }
        this.transaction.from = inputs;
        this.transaction.to = outputs;
        this.transaction.ts = Number(timestamp);
        this.transaction.sig = signature;
        this.transaction.path = path;
        this.transaction.type = transaction_type;
        this.transaction.m = Buffer.from(message).toString();
        try {
            if (this.transaction.type === TransactionType.Normal) {
                var reconstruct = app.crypto.base64ToString(Buffer.from(this.transaction.m).toString());
                this.msg = JSON.parse(reconstruct);
            }
            //            console.log("reconstructed msg: " + JSON.stringify(this.msg));
        }
        catch (err) {
            console.error("error trying to parse this.msg: ", err);
        }
    };
    Transaction.prototype.generateRebroadcastTransaction = function (app, output_slip_to_rebroadcast, with_fee) {
        var transaction = new Transaction();
        var output_payment = BigInt(0);
        if (output_slip_to_rebroadcast.returnAmount() > with_fee) {
            output_payment = BigInt(output_slip_to_rebroadcast.returnAmount()) - BigInt(with_fee);
        }
        transaction.transaction.type = TransactionType.ATR;
        var output = new slip_1.default();
        output.add = output_slip_to_rebroadcast.add;
        output.amt = output_payment;
        output.type = slip_1.SlipType.ATR;
        output.uuid = output_slip_to_rebroadcast.uuid;
        //
        // if this is the FIRST time we are rebroadcasting, we copy the
        // original transaction into the message field in serialized
        // form. this preserves the original message and its signature
        // in perpetuity.
        //
        // if this is the SECOND or subsequent rebroadcast, we do not
        // copy the ATR tx (no need for a meta-tx) and rather just update
        // the message field with the original transaction (which is
        // by definition already in the previous TX message space.
        //
        if (output_slip_to_rebroadcast.type === slip_1.SlipType.ATR) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            transaction.transaction.m = transaction_to_rebroadcast.transaction.m;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            transaction.transaction.m = transaction_to_rebroadcast.serialize(app);
        }
        transaction.addOutput(output);
        //
        // signature is the ORIGINAL signature. this transaction
        // will fail its signature check and then get analysed as
        // a rebroadcast transaction because of its transaction type.
        //
        transaction.sign(app);
        return transaction;
    };
    Transaction.prototype.isGoldenTicket = function () {
        if (this.transaction.type === TransactionType.GoldenTicket) {
            //            console.log("is this a golden ticket: yes");
            return true;
        }
        return false;
    };
    Transaction.prototype.isFeeTransaction = function () {
        if (this.transaction.type === TransactionType.Fee) {
            return true;
        }
        return false;
    };
    Transaction.prototype.isIssuanceTransaction = function () {
        if (this.transaction.type === TransactionType.Issuance) {
            return true;
        }
        return false;
    };
    Transaction.prototype.isFrom = function (senderPublicKey) {
        if (this.returnSlipsFrom(senderPublicKey).length !== 0) {
            return true;
        }
        return false;
    };
    Transaction.prototype.isTo = function (receiverPublicKey) {
        if (this.returnSlipsTo(receiverPublicKey).length > 0) {
            return true;
        }
        return false;
    };
    Transaction.prototype.onChainReorganization = function (app, lc, block_id) {
        var input_slip_value = 1;
        var output_slip_value = 0;
        if (lc) {
            input_slip_value = block_id;
            output_slip_value = 1;
        }
        for (var i = 0; i < this.transaction.from.length; i++) {
            this.transaction.from[i].onChainReorganization(app, lc, input_slip_value);
        }
        for (var i = 0; i < this.transaction.to.length; i++) {
            this.transaction.to[i].onChainReorganization(app, lc, output_slip_value);
        }
    };
    Transaction.prototype.asReadableString = function () {
        var html = '';
        html += "\n      timestamp:   ".concat(this.transaction.ts, "\n      signature:   ").concat(this.transaction.sig, "\n      type:        ").concat(this.transaction.type, "\n      message:     ").concat(this.transaction.m, "\n      === from slips ==\n");
        for (var i = 0; i < this.transaction.from.length; i++) {
            html += this.transaction.from[i].asReadableString();
            html += "\n";
        }
        html += "      === to slips ==\n";
        for (var i = 0; i < this.transaction.to.length; i++) {
            html += this.transaction.to[i].asReadableString();
            html += "\n";
        }
        html += "\n";
        return html;
    };
    Transaction.prototype.returnFeesTotal = function (app) {
        if (this.fees_total === BigInt(0)) {
            //
            // sum inputs
            //
            var inputs = BigInt(0);
            if (this.transaction.from != null) {
                for (var v = 0; v < this.transaction.from.length; v++) {
                    inputs += this.transaction.from[v].returnAmount();
                }
            }
            //
            // sum outputs
            //
            var outputs = BigInt(0);
            for (var v = 0; v < this.transaction.to.length; v++) {
                //
                // do not count outputs in GT and FEE txs create outputs that cannot be counted.
                //
                if (this.transaction.to[v].type !==
                    TransactionType.Fee &&
                    this.transaction.to[v].type !==
                        TransactionType.GoldenTicket) {
                    outputs += this.transaction.to[v].returnAmount();
                }
            }
            this.fees_total = inputs - outputs;
        }
        return this.fees_total;
    };
    Transaction.prototype.returnMessage = function () {
        if (this.dmsg !== "") {
            return this.dmsg;
        }
        if (this.msg !== {}) {
            return this.msg;
        }
        try {
            var reconstruct = this.base64ToString(Buffer.from(this.transaction.m).toString());
            this.msg = JSON.parse(reconstruct);
        }
        catch (err) {
            console.error(err);
        }
        return this.msg;
    };
    /*
        returnMessage() {
            if (this.dmsg !== "") {
                return this.dmsg;
            }
            if (this.msg !== {}) {
                return this.msg;
            }
            try {
                let x = Buffer.from(JSON.stringify(this.transaction.m), 'hex').toString('utf-8');
                this.msg = JSON.parse(x);
            } catch (err) {
            }
        }
    */
    Transaction.prototype.returnRoutingWorkAvailableToPublicKey = function (app) {
        var uf = this.returnFeesTotal(app);
        for (var i = 0; i < this.transaction.path.length; i++) {
            var d = 1;
            for (var j = i; j > 0; j--) {
                d = d * 2;
            }
            uf /= BigInt(d);
        }
        return uf;
    };
    Transaction.prototype.returnSignature = function (app, force) {
        if (force === void 0) { force = 0; }
        if (this.transaction.sig !== "" && force != 1) {
            return this.transaction.sig;
        }
        this.sign(app);
        return this.transaction.sig;
    };
    Transaction.prototype.returnSlipsFrom = function (publickey) {
        var x = [];
        if (this.transaction.from != null) {
            for (var v = 0; v < this.transaction.from.length; v++) {
                if (this.transaction.from[v].add === publickey) {
                    x.push(this.transaction.from[v]);
                }
            }
        }
        return x;
    };
    Transaction.prototype.returnSlipsToAndFrom = function (publickey) {
        var x = {};
        x.from = [];
        x.to = [];
        if (this.transaction.from != null) {
            for (var v = 0; v < this.transaction.from.length; v++) {
                if (this.transaction.from[v].add === publickey) {
                    x.from.push(this.transaction.from[v]);
                }
            }
        }
        if (this.transaction.to != null) {
            for (var v = 0; v < this.transaction.to.length; v++) {
                if (this.transaction.to[v].add === publickey) {
                    x.to.push(this.transaction.to[v]);
                }
            }
        }
        return x;
    };
    Transaction.prototype.returnSlipsTo = function (publickey) {
        var x = [];
        if (this.transaction.to != null) {
            for (var v = 0; v < this.transaction.to.length; v++) {
                if (this.transaction.to[v].add === publickey) {
                    x.push(this.transaction.to[v]);
                }
            }
        }
        return x;
    };
    Transaction.prototype.returnWinningRoutingNode = function (random_number) {
        //
        // if there are no routing paths, we return the sender of
        // the payment, as they're got all of the routing work by
        // definition. this is the edge-case where sending a tx
        // can make you money.
        //
        if (this.path.length === 0) {
            if (this.transaction.from.length !== 0) {
                return this.transaction.from[0].returnPublicKey();
            }
        }
        //
        // no winning transaction should have no fees unless the
        // entire block has no fees, in which case we have a block
        // without any fee-paying transactions.
        //
        // burn these fees for the sake of safety.
        //
        if (this.returnFeesTotal() === BigInt(0)) {
            return "";
        }
        //
        // if we have a routing path, we calculate the total amount
        // of routing work that it is possible for this transaction
        // to contain (2x the fee).
        //
        var aggregate_routing_work = this.returnTotalFees();
        var routing_work_this_hop = aggregate_routing_work;
        var work_by_hop = [];
        work_by_hop.push(aggregate_routing_work);
        for (var i = 0; i < this.path.length; i++) {
            var new_routing_work_this_hop = routing_work_this_hop / BigInt(2);
            aggregate_routing_work += new_routing_work_this_hop;
            routing_work_this_hop = new_routing_work_this_hop;
            work_by_hop.push(aggregate_routing_work);
        }
        //
        // find winning routing node
        //
        var x = BigInt('0x' + random_number);
        var z = BigInt('0x' + aggregate_routing_work);
        var winning_routing_work_in_nolan = x % z;
        for (var i = 0; i < work_by_hop.length; i++) {
            if (winning_routing_work_in_nolan <= work_by_hop[i]) {
                return this.path[i].returnTo();
            }
        }
        //
        // we should never reach this
        //
        return "";
    };
    /**
     * Serialize TX
     * @param {TransactionV2} transaction
     * @returns {array} raw bytes
     */
    Transaction.prototype.serialize = function (app) {
        //console.log("tx.serialize", this.transaction);
        var inputs_len = app.binary.u32AsBytes(this.transaction.from.length);
        var outputs_len = app.binary.u32AsBytes(this.transaction.to.length);
        var message_len = app.binary.u32AsBytes(this.transaction.m.length);
        var path_len = app.binary.u32AsBytes(this.transaction.path.length);
        var signature = app.binary.hexToSizedArray(this.transaction.sig, 64);
        var timestamp = app.binary.u64AsBytes(this.transaction.ts);
        var transaction_type = app.binary.u8AsByte(this.transaction.type);
        var inputs = [];
        var outputs = [];
        var path = [];
        ///
        ///  reference for starting point of inputs
        ///
        /// [len of inputs - 4 bytes - u32]
        /// [len of outputs - 4 bytes - u32]
        /// [len of message - 4 bytes - u32]
        /// [len of path - 4 bytes - u32]
        /// [signature - 64 bytes - Secp25k1 sig]
        /// [timestamp - 8 bytes - u64]
        /// [transaction type - 1 byte]
        /// [input][input][input]...
        /// [output][output][output]...
        /// [message]
        /// [hop][hop][hop]...
        var start_of_inputs = exports.TRANSACTION_SIZE;
        var start_of_outputs = exports.TRANSACTION_SIZE + ((this.transaction.from.length) * exports.SLIP_SIZE);
        var start_of_message = exports.TRANSACTION_SIZE + ((this.transaction.from.length + this.transaction.to.length) * exports.SLIP_SIZE);
        var start_of_path = exports.TRANSACTION_SIZE + ((this.transaction.from.length + this.transaction.to.length) * exports.SLIP_SIZE) + this.transaction.m.length;
        var size_of_tx_data = exports.TRANSACTION_SIZE +
            ((this.transaction.from.length + this.transaction.to.length) * exports.SLIP_SIZE) +
            this.transaction.m.length +
            this.transaction.path.length *
                exports.HOP_SIZE;
        var ret = new Uint8Array(size_of_tx_data);
        ret.set(new Uint8Array(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(inputs_len), false), __read(outputs_len), false), __read(message_len), false), __read(path_len), false), __read(signature), false), __read(timestamp), false), [
            transaction_type
        ], false)), 0);
        for (var i = 0; i < this.transaction.from.length; i++) {
            inputs.push(this.transaction.from[i].serialize(app));
        }
        var next_input_location = start_of_inputs;
        for (var i = 0; i < inputs.length; i++) {
            ret.set(inputs[i], next_input_location);
            next_input_location += exports.SLIP_SIZE;
        }
        for (var i = 0; i < this.transaction.to.length; i++) {
            outputs.push(this.transaction.to[i].serialize(app));
        }
        var next_output_location = start_of_outputs;
        for (var i = 0; i < outputs.length; i++) {
            ret.set(outputs[i], next_output_location);
            next_output_location += exports.SLIP_SIZE;
        }
        //
        // convert message to hex as otherwise issues in current implementation
        //
        var m_as_hex = Buffer.from(this.transaction.m).toString('hex');
        // binary requires 1/2 length of hex string
        var tm = app.binary.hexToSizedArray(m_as_hex, m_as_hex.length / 2);
        ret.set(tm, start_of_message);
        for (var i = 0; i < this.transaction.path.length; i++) {
            var serialized_hop = this.transaction.path[i].serialize(app);
            path.push(serialized_hop);
        }
        var next_hop_location = start_of_path;
        for (var i = 0; i < path.length; i++) {
            ret.set(path[i], next_hop_location);
            next_hop_location += exports.HOP_SIZE;
        }
        return ret;
    };
    Transaction.prototype.serializeForSignature = function (app) {
        var buffer = Buffer.from(app.binary.u64AsBytes(this.transaction.ts));
        for (var i = 0; i < this.transaction.from.length; i++) {
            buffer = Buffer.concat([buffer, Buffer.from(this.transaction.from[i].serializeInputForSignature(app))]);
        }
        for (var i = 0; i < this.transaction.to.length; i++) {
            buffer = Buffer.concat([buffer, Buffer.from(this.transaction.to[i].serializeOutputForSignature(app))]);
        }
        buffer = Buffer.concat([buffer, Buffer.from(app.binary.u32AsBytes(this.transaction.type))]);
        var m_as_hex = Buffer.from(this.transaction.m).toString('hex');
        var tm = app.binary.hexToSizedArray(m_as_hex, m_as_hex.length / 2);
        buffer = Buffer.concat([buffer, tm]);
        return Uint8Array.from(buffer);
    };
    Transaction.prototype.sign = function (app) {
        //
        // set slip ordinals
        //
        for (var i = 0; i < this.transaction.to.length; i++) {
            this.transaction.to[i].sid = i;
        }
        //
        // transaction message
        //
        if (this.transaction.m == "") {
            this.transaction.m = app.crypto.stringToBase64(JSON.stringify(this.msg));
        }
        this.transaction.sig = app.crypto.signBuffer(this.serializeForSignature(app), app.wallet.returnPrivateKey());
    };
    Transaction.prototype.validate = function (app) {
        //
        // Fee Transactions are validated in the block class. There can only
        // be one per block, and they are checked by ensuring the transaction hash
        // matches our self-generated safety check. We do not need to validate
        // their input slips as their input slips are records of what to do
        // when reversing/unwinding the chain and have been spent previously.
        //
        if (this.transaction.type === TransactionType.Fee) {
            return true;
        }
        //
        // User-Sent Transactions
        //
        // most transactions are identifiable by the publickey that
        // has signed their input transaction, but some transactions
        // do not have senders as they are auto-generated as part of
        // the block itself.
        //
        // ATR transactions
        // VIP transactions
        // FEE transactions
        //
        // the first set of validation criteria is applied only to
        // user-sent transactions. validation criteria for the above
        // classes of transactions are further down in this function.
        // at the bottom is the validation criteria applied to ALL
        // transaction types.
        //
        if (this.transaction.type !== TransactionType.Fee
            && this.transaction.type !== TransactionType.ATR
            && this.transaction.type !== TransactionType.Vip
            && this.transaction.type !== TransactionType.Issuance) {
            //
            // validate sender exists
            //
            if (this.transaction.from.length < 1) {
                console.log("ERROR 582039: less than 1 input in transaction");
                return false;
            }
            //
            // validate signature
            //
            if (!app.crypto.verifyHash(app.crypto.hash(this.serializeForSignature(app)), this.transaction.sig, this.transaction.from[0].add)) {
                console.log("ERROR:382029: transaction signature does not validate");
                return false;
            }
            //
            // validate routing path sigs
            //
            if (!this.validateRoutingPath()) {
                console.log("ERROR 482033: routing paths do not validate, transaction invalid");
                return false;
            }
            //
            // validate we're not creating tokens out of nothing
            //
            var total_in = BigInt(0);
            var total_out = BigInt(0);
            for (var i = 0; i < this.transaction.from.length; i++) {
                total_in += this.transaction.from[i].returnAmount();
            }
            for (var i = 0; i < this.transaction.to.length; i++) {
                total_out += this.transaction.to[i].returnAmount();
            }
            if (total_out > total_in &&
                this.transaction.type !== TransactionType.Fee &&
                this.transaction.type !== TransactionType.Vip) {
                console.log("ERROR 802394: transaction spends more than it has available");
                return false;
            }
        }
        //
        // fee transactions
        //
        if (this.transaction.type === TransactionType.Fee) {
        }
        //
        // atr transactions
        //
        if (this.transaction.type === TransactionType.ATR) {
        }
        //
        // normal transactions
        //
        if (this.transaction.type === TransactionType.Normal) {
        }
        //
        // golden ticket transactions
        //
        if (this.transaction.type === TransactionType.GoldenTicket) {
        }
        //
        // Staking Withdrawal Transactions
        //
        if (this.transaction.type === TransactionType.StakerWithdrawal) {
            for (var i = 0; i < this.transaction.from.length; i++) {
                if (this.transaction.from[i].type === slip_1.SlipType.StakerWithdrawalPending) {
                    if (!app.staking.validateSlipInPending(this.transaction.from[i])) {
                        console.log("ERROR 089231: Staking Withdrawal Pending input slip is not in Pending thus transaction invalid!");
                        return false;
                    }
                }
                if (this.transaction.from[i].type === slip_1.SlipType.StakerWithdrawalStaking) {
                    if (!app.staking.validateSlipInStakers(this.transaction.from[i])) {
                        console.log("ERROR 089231: Staking Withdrawal Staking input slip is not in Stakers thus transaction invalid!");
                        return false;
                    }
                }
            }
        }
        //
        // vip transactions
        //
        // a special class of transactions that do not pay rebroadcasting
        // fees. these are issued to the early supporters of the Saito
        // project. they carried us and we're going to carry them. thanks
        // for the faith and support.
        //
        if (this.transaction.type === TransactionType.Vip) {
            //
            // validate VIP transactions appropriately signed
            //
        }
        //
        // all Transactions
        //
        //
        // must have outputs
        //
        if (this.transaction.to.length === 0) {
            console.log("ERROR 582039: transaction does not have a single output");
            return false;
        }
        //
        // must have valid slips
        //
        for (var i = 0; i < this.transaction.from.length; i++) {
            if (this.transaction.from[i].validate(app) !== true) {
                console.log("ERROR 858043: transaction does not have valid slips");
                return false;
            }
        }
        return true;
    };
    Transaction.prototype.validateRoutingPath = function () {
        console.log("JS needs to validate routing paths still...");
        //
        // return true;
        //
        return true;
    };
    Transaction.prototype.generateMetadata = function () {
    };
    Transaction.prototype.generateMetadataCumulativeFees = function () {
        return BigInt(0);
    };
    Transaction.prototype.generateMetadataCumulativeWork = function () {
        return BigInt(0);
    };
    /* stolen from app crypto to avoid including app */
    Transaction.prototype.stringToBase64 = function (str) {
        return Buffer.from(str, 'utf-8').toString('base64');
    };
    Transaction.prototype.base64ToString = function (str) {
        return Buffer.from(str, 'base64').toString('utf-8');
    };
    return Transaction;
}());
exports.default = Transaction;
//# sourceMappingURL=transaction.js.map