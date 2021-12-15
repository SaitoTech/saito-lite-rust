import saito from "./saito";

test("u64FromBytes", () => {
    let mockApp = {};
    let binary = new saito.binary(mockApp);
    let value = BigInt(1637034582666);
    let buffer = binary.u64AsBytes(value.toString());
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
test("u32FromBytes_2", () => {
    let mockApp = {};
    let binary = new saito.binary(mockApp);
    let value = 2288066026;
    let buffer = binary.u32AsBytes(value);
    let new_value = binary.u32FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
test("timestamp check", () => {
    let mockApp = {};
    let binary = new saito.binary(mockApp);
    let tested = BigInt(1638670605802);
    let testbytes = binary.u64AsBytes(tested.toString());
    let recreated = binary.u64FromBytes(testbytes);

    expect(tested).toEqual(recreated);
});
