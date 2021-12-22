"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var burnfee_1 = __importDefault(require("./burnfee"));
test("burnfee routing work needed tests", function () {
    var burnfee = new burnfee_1.default();
    var bf1 = burnfee.returnRoutingWorkNeededToProduceBlockInNolan(BigInt(10), 2 * burnfee.heartbeat, 0);
    var bf2 = burnfee.returnRoutingWorkNeededToProduceBlockInNolan(BigInt(1000000000), 0, 0);
    var bf3 = burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(BigInt(100000000), burnfee.heartbeat, 0);
    var bf4 = burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(BigInt(100000000), burnfee.heartbeat / 10, 0);
    var bf4out = BigInt(Math.round(100000000 * Math.sqrt(10.0)));
    expect(bf1.toString()).toEqual(BigInt(0).toString());
    expect(bf2.toString()).toEqual(BigInt(10000000000000000000).toString());
    expect(bf3.toString()).toEqual(BigInt(100000000).toString());
    expect(bf4.toString()).toEqual(bf4out.toString());
});
//# sourceMappingURL=burnfee.spec.js.map