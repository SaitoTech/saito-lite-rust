'use strict'

const Big = require('big.js')

export default class BurnFee {
    public heartbeat: any;

    constructor() {
        //this.heartbeat = 30_000;
        this.heartbeat = 5_000;
    }

    returnRoutingWorkNeededToProduceBlockInNolan(burn_fee_previous_block, current_block_timestamp: number, previous_block_timestamp: number) {

        if (previous_block_timestamp >= current_block_timestamp) {
            return BigInt("10000000000000000000");
        }

        let elapsed_time = current_block_timestamp - previous_block_timestamp;
        if (elapsed_time == 0) {
            elapsed_time = 1;
        }
        if (elapsed_time >= (2 * this.heartbeat)) {
            return BigInt(0);
        }

        // convert to float for division
        let elapsed_time_float = elapsed_time;
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

        //
        // impossible if times misordered
        //
        if (previous_block_timestamp >= current_block_timestamp) {
            return BigInt("10_000_000_000_000_000_000");
        }

        let timestamp_difference = current_block_timestamp - previous_block_timestamp;
        if (timestamp_difference == 0) {
            timestamp_difference = 1;
        }

        // algorithm fails if burn fee last block is 0, so default to low value
        if (burn_fee_previous_block == BigInt(0)) {
            return BigInt(50_000_000);
        }

        // TODO : check whether overflow occurs
        let burn_fee_previous_block_as_float = parseFloat(burn_fee_previous_block.toString()) / 100000000.0;
        let res1 = burn_fee_previous_block_as_float * Math.sqrt(parseFloat(this.heartbeat) / timestamp_difference);
        let new_burnfee = Math.round(res1 * 100000000);
        return BigInt(new_burnfee);

    }


}

