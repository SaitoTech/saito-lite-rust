"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var binary_1 = __importDefault(require("./binary"));
test("u64FromBytes", function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var mockApp = {};
    var binary = new binary_1.default(mockApp);
    var value = BigInt(1637034582666);
    var buffer = binary.u64AsBytes(value.toString());
    var new_value = binary.u64FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
test("u32FromBytes", function () {
    var mockApp = {};
    var binary = new binary_1.default(mockApp);
    var value = 123456;
    var buffer = binary.u32AsBytes(value);
    var new_value = binary.u32FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
test("u32FromBytes_2", function () {
    var mockApp = {};
    var binary = new binary_1.default(mockApp);
    var value = 2288066026;
    var buffer = binary.u32AsBytes(value);
    var new_value = binary.u32FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
test("timestamp check", function () {
    var mockApp = {};
    var binary = new binary_1.default(mockApp);
    var tested = BigInt(1638670605802);
    var testbytes = binary.u64AsBytes(tested.toString());
    var recreated = binary.u64FromBytes(testbytes);
    expect(tested).toEqual(recreated);
});
//# sourceMappingURL=binary.spec.js.map