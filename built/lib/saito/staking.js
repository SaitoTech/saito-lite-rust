"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var slip_1 = require("./slip");
var transaction_1 = require("./transaction");
var Staking = /** @class */ (function () {
    function Staking(app) {
        this.app = app || {};
        this.deposits = [];
        this.stakers = [];
        this.pending = [];
    }
    Staking.prototype.findWinningStaker = function (random_hash) {
        if (this.stakers.length == 0) {
            return null;
        }
        //
        // find winning staker
        //
        var x = BigInt('0x' + random_hash);
        var z = BigInt(this.stakers.length);
        var retrieve_from_pos = x % z;
        var winning_slip = this.stakers[parseInt(retrieve_from_pos.toString())].clone();
        return winning_slip;
    };
    Staking.prototype.onChainReorganization = function (block, lc) {
        var res_spend = [];
        var res_unspend = [];
        var res_delete = [];
        //
        // add/remove deposits
        //
        for (var i = 0; i < block.transactions.length; i++) {
            var tx = block.transactions[i];
            if (tx.transaction.type === transaction_1.TransactionType.StakerWithdrawal) {
                //
                // someone has successfully withdrawn so we need to remove this slip
                // from the necessary table if moving forward, or add it back if
                // moving backwards.
                //
                // roll forward
                //
                if (lc) {
                    if (tx.transaction.from[0].type == slip_1.SlipType.StakerWithdrawalPending) {
                        this.removePending(tx.transaction.from[0]);
                    }
                    if (tx.transaction.from[0].type == slip_1.SlipType.StakerWithdrawalStaking) {
                        this.removeStaker(tx.transaction.from[0]);
                    }
                    //
                    // roll backward
                    //
                }
                else {
                    if (tx.transaction.from[0].type == slip_1.SlipType.StakerWithdrawalPending) {
                        this.addPending(tx.transaction.from[0]);
                    }
                    if (tx.transaction.from[0].type == slip_1.SlipType.StakerWithdrawalStaking) {
                        this.addStaker(tx.transaction.from[0]);
                    }
                }
            }
            if (tx.transaction.type === transaction_1.TransactionType.StakerDeposit) {
                for (var k = 0; k < tx.transaction.to.length; k++) {
                    if (tx.transaction.to[k].type == slip_1.SlipType.StakerDeposit) {
                        //
                        // roll forward
                        //
                        if (lc) {
                            this.addDeposit(tx.transaction.to[k]);
                            //
                            // roll backward
                            //
                        }
                        else {
                            this.removeDeposit(tx.transaction.to[k]);
                        }
                    }
                }
            }
        }
        //
        // reset tables if needed
        //
        if (lc) {
            //
            // reset stakers if necessary
            //
            if (this.stakers.length == 0) {
                var return_value = this.resetStakerTable(block.returnStakingTreasury());
                res_spend = return_value.res_spend;
                res_unspend = return_value.res_unspend;
                res_delete = return_value.res_delete;
            }
        }
        else {
            //
            // reset pending if necessary
            //
            if (this.pending.length == 0) {
                this.pending = [];
                this.deposits = [];
                for (var k = 0; k < this.stakers.length; k++) {
                    if (this.stakers[k].type == slip_1.SlipType.StakerOutput) {
                        this.pending.push(this.stakers[k]);
                    }
                    if (this.stakers[k].type == slip_1.SlipType.StakerDeposit) {
                        this.deposits.push(this.stakers[k]);
                    }
                }
                this.stakers = [];
            }
        }
        //
        // update staking tables
        //
        if (block.hasFeeTransaction() && block.hasGoldenTicket()) {
            var fee_transaction = block.returnFeeTransaction();
            var golden_ticket_transaction = block.returnGoldenTicketTransaction();
            //
            // grab random input from golden ticket
            //
            var golden_ticket_data = this.app.goldenticket.deserializeFromTransaction(golden_ticket_transaction);
            var target_hash = golden_ticket_data.target_hash;
            var next_random_number = golden_ticket_data.random_hash;
            var creator = golden_ticket_data.creator;
            // pick router and burn one
            next_random_number = this.app.crypto.hash(next_random_number);
            next_random_number = this.app.crypto.hash(next_random_number);
            var is_there_a_staker_output = false;
            for (var k = 0; k < fee_transaction.transaction.to.length; k++) {
                if (fee_transaction.transaction.to[k].type == slip_1.SlipType.StakerOutput) {
                    is_there_a_staker_output = true;
                }
            }
            if (is_there_a_staker_output == false || fee_transaction.transaction.transaction.from.length == 0) {
                return { res_spend: res_spend, res_unspend: res_unspend, res_delete: res_delete };
            }
            //
            // process outbound staking payments
            //
            var slips_to_remove_from_staking = [];
            var slips_to_add_to_pending = [];
            var staker_slip_num = 0;
            //
            // roll forward
            //
            if (lc) {
                //
                // re-create staker table, if needed
                //
                // we do this at both the start and the end of this function so that
                // we will always have a table that can be handled regardless of
                // vacillations in on_chain_reorg, such as resetting the table and
                // then non-longest-chaining the same block
                //
                if (this.stakers.length == 0) {
                    var return_value = this.resetStakerTable(block.returnStakingTreasury());
                    res_spend = return_value.res_spend;
                    res_unspend = return_value.res_unspend;
                    res_delete = return_value.res_delete;
                    for (var k = 0; k < fee_transaction.transaction.to.length; k++) {
                        var staker_output = fee_transaction.transaction.to[k].clone();
                        // we have already handled all stakers
                        if (fee_transaction.transaction.from.length <= staker_slip_num) {
                            break;
                        }
                        if (staker_output.type == slip_1.SlipType.StakerOutput) {
                            // ROUTER BURNED FIRST
                            next_random_number = this.app.crypto.hash(next_random_number); // router + burn
                            next_random_number = this.app.crypto.hash(next_random_number); // burn second
                            //
                            // move staker to pending
                            //
                            var lucky_staker = this.findWinningStaker(next_random_number); // use first
                            slips_to_remove_from_staking.push(lucky_staker.clone());
                            slips_to_add_to_pending.push(staker_output.clone());
                        }
                        staker_slip_num += 1;
                        // setup for router selection next loop
                        next_random_number = this.app.crypto.hash(next_random_number);
                    }
                }
                //
                // we handle the slips together like this as we can occasionally
                // get duplicates if the same slip is selected recursively, but
                // we do not pay out duplicates. so we only add to pending if we
                // successfully remove from the staker table.
                //
                for (var k = 0; k < slips_to_remove_from_staking.length; k++) {
                    if (this.removeStaker(slips_to_remove_from_staking[k].clone()) == true) {
                        this.addPending(slips_to_add_to_pending[k].clone());
                    }
                }
                //
                // re-create staker table, if needed
                //
                if (this.stakers.length == 0) {
                    var return_value = this.resetStakerTable(block.returnStakingTreasury());
                    res_spend = return_value.res_spend;
                    res_unspend = return_value.res_unspend;
                    res_delete = return_value.res_delete;
                }
                //
                // roll backward
                //
            }
            else {
                //
                // reset pending if necessary
                //
                if (this.pending.length == 0) {
                    this.pending = [];
                    this.deposits = [];
                    for (var k = 0; k < this.stakers.length; k++) {
                        if (this.stakers[k].type == slip_1.SlipType.StakerOutput) {
                            this.pending.push(this.stakers[k].clone());
                        }
                        if (this.stakers[k].type == slip_1.SlipType.StakerDeposit) {
                            this.deposits.push(this.stakers[k].clone());
                        }
                    }
                    this.stakers = [];
                }
                //
                // process outbound staking payments
                //
                var staker_slip_num_1 = 0;
                for (var k = 0; k < fee_transaction.transaction.to.length; k++) {
                    var staker_output = fee_transaction.transaction.to[k].clone();
                    if (fee_transaction.transaction.from.length < staker_slip_num_1) {
                        break;
                    }
                    var staker_input = fee_transaction.transaction.from[staker_slip_num_1].clone();
                    if (staker_output.type == slip_1.SlipType.StakerOutput) {
                        //
                        // remove from pending to staker (awaiting payout)
                        //
                        this.removePending(staker_output.clone());
                        var slip_type = staker_input.type;
                        if (slip_type == slip_1.SlipType.StakerDeposit) {
                            this.addDeposit(staker_input.clone());
                        }
                        if (slip_type == slip_1.SlipType.StakerOutput) {
                            this.addStaker(staker_input.clone());
                        }
                        staker_slip_num_1 += 1;
                    }
                }
                //
                // reset pending if necessary
                //
                if (this.pending.length == 0) {
                    this.pending = [];
                    this.deposits = [];
                    for (var k = 0; k < this.stakers.length; k++) {
                        if (this.stakers[k].type == slip_1.SlipType.StakerOutput) {
                            this.pending.push(this.stakers[k].clone());
                        }
                        if (this.stakers[k].type == slip_1.SlipType.StakerDeposit) {
                            this.deposits.push(this.stakers[k].clone());
                        }
                    }
                    this.stakers = [];
                }
            }
        }
        return { res_spend: res_spend, res_unspend: res_unspend, res_delete: res_delete };
    };
    //
    // resets the staker table
    //
    // without using floating-point division, we calculate the share that each staker
    // should earn of the upcoming sweep through the stakers table, and insert the
    // pending and pending-deposits slips into the staking table with the updated
    // expected payout.
    //
    // returns three vectors with slips to SPEND, UNSPEND, DELETE
    //
    // wny?
    //
    // we cannot pass the UTXOSet into the staking object to update as that would
    // require multiple mutable borrows of the blockchain object, so we receive
    // vectors of the slips that need to be inserted, spent or deleted in the
    // blockchain and handle after-the-fact. This permits keeping the UTXOSET
    // up-to-date with the staking tables.
    //
    Staking.prototype.resetStakerTable = function (staking_treasury) {
        //console.log("===========================");
        //console.log("=== RESET STAKING TABLE ===");
        //console.log("===========================");
        var res_spend = [];
        var res_unspend = [];
        var res_delete = [];
        //
        // move pending into staking table
        //
        for (var i = 0; i < this.pending.length; i++) {
            this.addStaker(this.pending[i].clone());
        }
        for (var i = 0; i < this.deposits.length; i++) {
            this.addStaker(this.deposits[i].clone());
        }
        this.pending = [];
        this.deposits = [];
        if (this.stakers.length == []) {
            return { res_spend: [], res_unspend: [], res_delete: [] };
        }
        //
        // adjust the slip amounts based on genesis period
        //
        var staking_payout_per_block = staking_treasury / BigInt(this.app.blockchain.blockchain.genesis_period);
        //
        // calculate average amount staked
        //
        var total_staked = BigInt(0);
        for (var i = 0; i < this.stakers.length; i++) {
            total_staked += this.stakers[i].returnAmount();
        }
        var average_staked = total_staked / BigInt(this.stakers.length);
        //
        // calculate the payout for average stake
        //
        var m = staking_payout_per_block;
        var p = BigInt(this.stakers.length);
        var average_staker_payout = m / p;
        //
        // and adjust the payout based on this....
        //
        for (var i = 0; i < this.stakers.length; i++) {
            //
            // get total staked
            //
            var my_staked_amount = this.stakers[i].returnAmount();
            //
            // figure how much we are due...
            //
            // my stake PLUS (my stake / 1 * ( my_stake / average_staked )
            // my stake PLUS (my stake / 1 * ( my_stake / average_staked ) * ( ( treasury / genesis_period )
            // my stake PLUS (my stake / 1 * ( my_stake / average_staked ) * ( ( treasury / genesis_period )
            //
            var a = BigInt(my_staked_amount);
            var b = BigInt(average_staker_payout);
            var nominator = a * b;
            var denominator = average_staked;
            var staking_profit = nominator / denominator;
            this.stakers[i].setPayout(staking_profit);
        }
        return { res_spend: res_spend, res_unspend: res_unspend, res_delete: res_delete };
    };
    Staking.prototype.validateSlipInDeposits = function (slip) {
        for (var i = 0; i < this.deposits.length; i++) {
            if (slip.returnKey() == this.deposits[i].returnKey()) {
                return true;
            }
        }
        return false;
    };
    Staking.prototype.validateSlipInStakers = function (slip) {
        for (var i = 0; i < this.stakers.length; i++) {
            if (slip.returnKey() == this.stakers[i].returnKey()) {
                return true;
            }
        }
        return false;
    };
    Staking.prototype.validateSlipInPending = function (slip) {
        for (var i = 0; i < this.pending.length; i++) {
            if (slip.returnKey() == this.pending[i].returnKey()) {
                return true;
            }
        }
        return false;
    };
    Staking.prototype.addDeposit = function (slip) {
        this.deposits.push(slip);
    };
    //
    // slips are added in ascending order based on publickey and then
    // UUID. this is simply to ensure that chain reorgs do not cause
    // disagreements about which staker is selected.
    //
    Staking.prototype.addStaker = function (slip) {
        //
        // TODO skip-hop algorithm instead of brute force
        //
        if (this.stakers.length == 0) {
            this.stakers.push(slip);
            return true;
        }
        else {
            for (var i = 0; i < this.stakers.length; i++) {
                var how_compares = slip.compare(this.stakers[i]);
                // 1 - this is bigger
                // 2 - this is smaller
                // 3 - both identical
                if (how_compares == 2) {
                    if (this.stakers.length == (i + 1)) {
                        this.stakers.push(slip);
                        return true;
                    }
                }
                else {
                    if (how_compares == 1) {
                        this.stakers.insert(i, slip);
                        return true;
                    }
                    if (how_compares == 3) {
                        return false;
                    }
                }
            }
            this.stakers.push(slip);
            return true;
        }
    };
    Staking.prototype.addPending = function (slip) {
        this.pending.push(slip);
    };
    Staking.prototype.removeDeposit = function (slip) {
        for (var i = 0; i < this.deposits.length; i++) {
            if (slip.returnKey() == this.deposits[i].returnKey()) {
                this.deposits.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Staking.prototype.removeStaker = function (slip) {
        for (var i = 0; i < this.stakers.length; i++) {
            if (slip.returnKey() == this.stakers[i].returnKey()) {
                this.stakers.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Staking.prototype.removePending = function (slip) {
        for (var i = 0; i < this.pending.length; i++) {
            if (slip.returnKey() == this.pending[i].returnKey()) {
                this.pending.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    return Staking;
}());
exports.default = Staking;
//# sourceMappingURL=staking.js.map