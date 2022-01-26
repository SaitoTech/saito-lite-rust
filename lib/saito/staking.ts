import { SlipType } from "./slip";
import { TransactionType } from "./transaction";
import { Saito } from "../../apps/core";

class Staking {
  public app: Saito;
  public deposits: any;
  public stakers: any;
  public pending: any;

  constructor(app: Saito) {
    this.app = app;

    this.deposits = [];
    this.stakers = [];
    this.pending = [];
  }

  findWinningStaker(random_hash) {
    if (this.stakers.length == 0) {
      return null;
    }

    //
    // find winning staker
    //
    const x = BigInt("0x" + random_hash);
    const z = BigInt(this.stakers.length);
    const retrieve_from_pos = x % z;

    const winning_slip = this.stakers[parseInt(retrieve_from_pos.toString())].clone();

    return winning_slip;
  }

  onChainReorganization(block, lc) {
    let res_spend = [];
    let res_unspend = [];
    let res_delete = [];

    //
    // add/remove deposits
    //
    for (let i = 0; i < block.transactions.length; i++) {
      const tx = block.transactions[i];

      if (tx.transaction.type === TransactionType.StakerWithdrawal) {
        //
        // someone has successfully withdrawn so we need to remove this slip
        // from the necessary table if moving forward, or add it back if
        // moving backwards.
        //
        // roll forward
        //
        if (lc) {
          if (tx.transaction.from[0].type == SlipType.StakerWithdrawalPending) {
            this.removePending(tx.transaction.from[0]);
          }
          if (tx.transaction.from[0].type == SlipType.StakerWithdrawalStaking) {
            this.removeStaker(tx.transaction.from[0]);
          }
          //
          // roll backward
          //
        } else {
          if (tx.transaction.from[0].type == SlipType.StakerWithdrawalPending) {
            this.addPending(tx.transaction.from[0]);
          }
          if (tx.transaction.from[0].type == SlipType.StakerWithdrawalStaking) {
            this.addStaker(tx.transaction.from[0]);
          }
        }
      }

      if (tx.transaction.type === TransactionType.StakerDeposit) {
        for (let k = 0; k < tx.transaction.to.length; k++) {
          if (tx.transaction.to[k].type == SlipType.StakerDeposit) {
            //
            // roll forward
            //
            if (lc) {
              this.addDeposit(tx.transaction.to[k]);
              //
              // roll backward
              //
            } else {
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
        const return_value = this.resetStakerTable(block.returnStakingTreasury());
        res_spend = return_value.res_spend;
        res_unspend = return_value.res_unspend;
        res_delete = return_value.res_delete;
      }
    } else {
      //
      // reset pending if necessary
      //
      if (this.pending.length == 0) {
        this.pending = [];
        this.deposits = [];
        for (let k = 0; k < this.stakers.length; k++) {
          if (this.stakers[k].type == SlipType.StakerOutput) {
            this.pending.push(this.stakers[k]);
          }
          if (this.stakers[k].type == SlipType.StakerDeposit) {
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
      const fee_transaction = block.returnFeeTransaction();
      const golden_ticket_transaction = block.returnGoldenTicketTransaction();

      //
      // grab random input from golden ticket
      //
      const golden_ticket_data =
        this.app.goldenticket.deserializeFromTransaction(golden_ticket_transaction);

      const target_hash = golden_ticket_data.target_hash;
      let next_random_number = golden_ticket_data.random_hash;
      const creator = golden_ticket_data.creator;

      // pick router and burn one
      next_random_number = this.app.crypto.hash(next_random_number);
      next_random_number = this.app.crypto.hash(next_random_number);

      let is_there_a_staker_output = false;

      for (let k = 0; k < fee_transaction.transaction.to.length; k++) {
        if (fee_transaction.transaction.to[k].type == SlipType.StakerOutput) {
          is_there_a_staker_output = true;
        }
      }
      if (
        is_there_a_staker_output == false ||
        fee_transaction.transaction.transaction.from.length == 0
      ) {
        return {
          res_spend: res_spend,
          res_unspend: res_unspend,
          res_delete: res_delete,
        };
      }
      //
      // process outbound staking payments
      //
      const slips_to_remove_from_staking = [];
      const slips_to_add_to_pending = [];
      let staker_slip_num = 0;
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
          const return_value = this.resetStakerTable(block.returnStakingTreasury());
          res_spend = return_value.res_spend;
          res_unspend = return_value.res_unspend;
          res_delete = return_value.res_delete;

          for (let k = 0; k < fee_transaction.transaction.to.length; k++) {
            const staker_output = fee_transaction.transaction.to[k].clone();

            // we have already handled all stakers
            if (fee_transaction.transaction.from.length <= staker_slip_num) {
              break;
            }

            if (staker_output.type == SlipType.StakerOutput) {
              // ROUTER BURNED FIRST
              next_random_number = this.app.crypto.hash(next_random_number); // router + burn
              next_random_number = this.app.crypto.hash(next_random_number); // burn second

              //
              // move staker to pending
              //
              const lucky_staker = this.findWinningStaker(next_random_number); // use first
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
        for (let k = 0; k < slips_to_remove_from_staking.length; k++) {
          if (this.removeStaker(slips_to_remove_from_staking[k].clone()) == true) {
            this.addPending(slips_to_add_to_pending[k].clone());
          }
        }

        //
        // re-create staker table, if needed
        //
        if (this.stakers.length == 0) {
          const return_value = this.resetStakerTable(block.returnStakingTreasury());
          res_spend = return_value.res_spend;
          res_unspend = return_value.res_unspend;
          res_delete = return_value.res_delete;
        }

        //
        // roll backward
        //
      } else {
        //
        // reset pending if necessary
        //
        if (this.pending.length == 0) {
          this.pending = [];
          this.deposits = [];

          for (let k = 0; k < this.stakers.length; k++) {
            if (this.stakers[k].type == SlipType.StakerOutput) {
              this.pending.push(this.stakers[k].clone());
            }
            if (this.stakers[k].type == SlipType.StakerDeposit) {
              this.deposits.push(this.stakers[k].clone());
            }
          }

          this.stakers = [];
        }

        //
        // process outbound staking payments
        //
        let staker_slip_num = 0;

        for (let k = 0; k < fee_transaction.transaction.to.length; k++) {
          const staker_output = fee_transaction.transaction.to[k].clone();
          if (fee_transaction.transaction.from.length < staker_slip_num) {
            break;
          }
          const staker_input = fee_transaction.transaction.from[staker_slip_num].clone();

          if (staker_output.type == SlipType.StakerOutput) {
            //
            // remove from pending to staker (awaiting payout)
            //
            this.removePending(staker_output.clone());
            const slip_type = staker_input.type;
            if (slip_type == SlipType.StakerDeposit) {
              this.addDeposit(staker_input.clone());
            }
            if (slip_type == SlipType.StakerOutput) {
              this.addStaker(staker_input.clone());
            }
            staker_slip_num += 1;
          }
        }

        //
        // reset pending if necessary
        //
        if (this.pending.length == 0) {
          this.pending = [];
          this.deposits = [];

          for (let k = 0; k < this.stakers.length; k++) {
            if (this.stakers[k].type == SlipType.StakerOutput) {
              this.pending.push(this.stakers[k].clone());
            }
            if (this.stakers[k].type == SlipType.StakerDeposit) {
              this.deposits.push(this.stakers[k].clone());
            }
          }
          this.stakers = [];
        }
      }
    }

    return {
      res_spend: res_spend,
      res_unspend: res_unspend,
      res_delete: res_delete,
    };
  }

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
  resetStakerTable(staking_treasury) {
    //console.log("===========================");
    //console.log("=== RESET STAKING TABLE ===");
    //console.log("===========================");

    const res_spend = [];
    const res_unspend = [];
    const res_delete = [];

    //
    // move pending into staking table
    //
    for (let i = 0; i < this.pending.length; i++) {
      this.addStaker(this.pending[i].clone());
    }
    for (let i = 0; i < this.deposits.length; i++) {
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
    const staking_payout_per_block =
      staking_treasury / BigInt(this.app.blockchain.blockchain.genesis_period);

    //
    // calculate average amount staked
    //
    let total_staked = BigInt(0);
    for (let i = 0; i < this.stakers.length; i++) {
      total_staked += this.stakers[i].returnAmount();
    }
    const average_staked = total_staked / BigInt(this.stakers.length);

    //
    // calculate the payout for average stake
    //
    const m = staking_payout_per_block;
    const p = BigInt(this.stakers.length);

    const average_staker_payout = m / p;

    //
    // and adjust the payout based on this....
    //
    for (let i = 0; i < this.stakers.length; i++) {
      //
      // get total staked
      //
      const my_staked_amount = this.stakers[i].returnAmount();

      //
      // figure how much we are due...
      //
      // my stake PLUS (my stake / 1 * ( my_stake / average_staked )
      // my stake PLUS (my stake / 1 * ( my_stake / average_staked ) * ( ( treasury / genesis_period )
      // my stake PLUS (my stake / 1 * ( my_stake / average_staked ) * ( ( treasury / genesis_period )
      //
      const a = BigInt(my_staked_amount);
      const b = BigInt(average_staker_payout);
      const nominator = a * b;
      const denominator = average_staked;

      const staking_profit = nominator / denominator;

      this.stakers[i].setPayout(staking_profit);
    }

    return {
      res_spend: res_spend,
      res_unspend: res_unspend,
      res_delete: res_delete,
    };
  }

  validateSlipInDeposits(slip) {
    for (let i = 0; i < this.deposits.length; i++) {
      if (slip.returnKey() == this.deposits[i].returnKey()) {
        return true;
      }
    }
    return false;
  }

  validateSlipInStakers(slip) {
    for (let i = 0; i < this.stakers.length; i++) {
      if (slip.returnKey() == this.stakers[i].returnKey()) {
        return true;
      }
    }
    return false;
  }

  validateSlipInPending(slip) {
    for (let i = 0; i < this.pending.length; i++) {
      if (slip.returnKey() == this.pending[i].returnKey()) {
        return true;
      }
    }
    return false;
  }

  addDeposit(slip) {
    this.deposits.push(slip);
  }

  //
  // slips are added in ascending order based on publickey and then
  // UUID. this is simply to ensure that chain reorgs do not cause
  // disagreements about which staker is selected.
  //
  addStaker(slip) {
    //
    // TODO skip-hop algorithm instead of brute force
    //
    if (this.stakers.length == 0) {
      this.stakers.push(slip);
      return true;
    } else {
      for (let i = 0; i < this.stakers.length; i++) {
        const how_compares = slip.compare(this.stakers[i]);

        // 1 - this is bigger
        // 2 - this is smaller
        // 3 - both identical
        if (how_compares == 2) {
          if (this.stakers.length == i + 1) {
            this.stakers.push(slip);
            return true;
          }
        } else {
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
  }

  addPending(slip) {
    this.pending.push(slip);
  }

  removeDeposit(slip) {
    for (let i = 0; i < this.deposits.length; i++) {
      if (slip.returnKey() == this.deposits[i].returnKey()) {
        this.deposits.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  removeStaker(slip) {
    for (let i = 0; i < this.stakers.length; i++) {
      if (slip.returnKey() == this.stakers[i].returnKey()) {
        this.stakers.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  removePending(slip) {
    for (let i = 0; i < this.pending.length; i++) {
      if (slip.returnKey() == this.pending[i].returnKey()) {
        this.pending.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}

export default Staking;
