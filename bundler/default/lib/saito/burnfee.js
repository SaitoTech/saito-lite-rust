'use strict'

const Big = require('big.js')

class BurnFee {

  constructor() {
    //this.heartbeat = 30_000;
    this.heartbeat = 5_000;
  }

  returnRoutingWorkNeededToProduceBlockInNolan(burn_fee_previous_block, current_block_timestamp, previous_block_timestamp) {

    if (previous_block_timestamp >= current_block_timestamp) {
      return 10_000_000_000_000_000_000;
    }

    let elapsed_time = current_block_timestamp - previous_block_timestamp;
    if (elapsed_time == 0) { elapsed_time = 1; }
    if (elapsed_time >= (2 * this.heartbeat)) { return 0; }

    // convert to float for division
    let elapsed_time_float = parseFloat(elapsed_time);
    let burn_fee_previous_block_as_float = parseFloat(burn_fee_previous_block.toString()) / 100_000_000.0;
    let work_needed_float = burn_fee_previous_block_as_float / elapsed_time_float;

    // convert back to nolan for rounding / safety
    return BigInt(Math.round(work_needed_float * 100_000_000.0));   

  }


  /// Returns an adjusted burnfee based on the start value provided
  /// and the difference between the current block timestamp and the
  /// previous block timestamp
  ///
  /// * `start` - The starting burn fee
  /// * `current_block_timestamp` - The timestamp of the current `Block`
  /// * `previous_block_timestamp` - The timestamp of the previous `Block`
  returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(burn_fee_previous_block, current_block_timestamp, previous_block_timestamp) {

console.log("cbt: " + current_block_timestamp);
console.log("pbt: " + previous_block_timestamp);

    //
    // impossible if times misordered
    //
    if (previous_block_timestamp >= current_block_timestamp) {
      return 10_000_000_000_000_000_000;
    }

    let timestamp_difference = current_block_timestamp - previous_block_timestamp;
    if (timestamp_difference == 0) { timestamp_difference = 1; }

    // algorithm fails if burn fee last block is 0, so default to low value
    if (burn_fee_previous_block == BigInt(0)) {
      return 50_000_000;
    }

console.log("Timestamp difference: " + timestamp_difference);
console.log("heartbeat: " + this.heartbeat);


console.log("BFPBAS: " + burn_fee_previous_block.toString());

    let burn_fee_previous_block_as_float = parseFloat(burn_fee_previous_block.toString()) / 100_000_000.0;
console.log("BFPBASAF: " + burn_fee_previous_block_as_float); 
console.log('mathsq' + Math.sqrt( (parseFloat(this.heartbeat) / parseFloat(timestamp_difference))));
    let res1 = burn_fee_previous_block_as_float * Math.sqrt( (parseFloat(this.heartbeat) / parseFloat(timestamp_difference)) );
console.log("RES1: " +res1);
    let new_burnfee = parseInt(Math.round(res1 * 100_000_000.0));
console.log("NEW BF: " + new_burnfee);
    return BigInt(new_burnfee);

  }


}

module.exports = BurnFee;

