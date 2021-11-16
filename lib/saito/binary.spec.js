const saito = require("./saito");
const Big = require('big.js');
test("u64FromBytes", () => {
    let mockApp = {};
    let binary = new saito.binary(mockApp);
    let value = new Big(1637034582666);
    let buffer = binary.u64AsBytes(value);
    let new_value = binary.u64FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
test("u32FromBytes", () => {
    let mockApp = {};
    let binary = new saito.binary(mockApp);
    let value = 123456;
    let buffer = binary.u32AsBytes(value);
    let new_value = binary.u32FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
