"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BurnFee = /** @class */ (function () {
    function BurnFee() {
        //this.heartbeat = 30_000;
        this.heartbeat = 5000;
    }
    BurnFee.prototype.returnRoutingWorkNeededToProduceBlockInNolan = function (burn_fee_previous_block, current_block_timestamp, previous_block_timestamp) {
        if (previous_block_timestamp >= current_block_timestamp) {
            return 10000000000000000000;
        }
        var elapsed_time = current_block_timestamp - previous_block_timestamp;
        if (elapsed_time == 0) {
            elapsed_time = 1;
        }
        if (elapsed_time >= (2 * this.heartbeat)) {
            return 0;
        }
        // convert to float for division
        var elapsed_time_float = parseFloat(elapsed_time + "");
        var burn_fee_previous_block_as_float = parseFloat(burn_fee_previous_block.toString()) / 100000000;
        var work_needed_float = burn_fee_previous_block_as_float / elapsed_time_float;
        // convert back to nolan for rounding / safety
        return BigInt(Math.round(work_needed_float * 100000000));
    };
    /// Returns an adjusted burnfee based on the start value provided
    /// and the difference between the current block timestamp and the
    /// previous block timestamp
    ///
    /// * `start` - The starting burn fee
    /// * `current_block_timestamp` - The timestamp of the current `Block`
    /// * `previous_block_timestamp` - The timestamp of the previous `Block`
    BurnFee.prototype.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan = function (burn_fee_previous_block, current_block_timestamp, previous_block_timestamp) {
        //
        // impossible if times misordered
        //
        if (previous_block_timestamp >= current_block_timestamp) {
            return 10000000000000000000;
        }
        var timestamp_difference = current_block_timestamp - previous_block_timestamp;
        if (timestamp_difference == 0) {
            timestamp_difference = 1;
        }
        // algorithm fails if burn fee last block is 0, so default to low value
        if (burn_fee_previous_block == BigInt(0)) {
            return 50000000;
        }
        var burn_fee_previous_block_as_float = parseFloat(burn_fee_previous_block.toString()) / 100000000;
        var res1 = burn_fee_previous_block_as_float * Math.sqrt((parseFloat(this.heartbeat) / timestamp_difference));
        var new_burnfee = Math.round(res1 * 100000000);
        return BigInt(new_burnfee);
    };
    return BurnFee;
}());
exports.default = BurnFee;
//# sourceMappingURL=burnfee.js.map