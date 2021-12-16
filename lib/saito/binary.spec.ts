import saito from "./saito";
import {Saito} from "../../apps/core";

test("u64FromBytes", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mockApp: Saito = {};
    const binary = new saito.binary(mockApp);
    const value = BigInt(1637034582666);
    const buffer = binary.u64AsBytes(value.toString());
    const new_value = binary.u64FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
test("u32FromBytes", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mockApp: Saito = {};
    const binary = new saito.binary(mockApp);
    const value = 123456;
    const buffer = binary.u32AsBytes(value);
    const new_value = binary.u32FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
test("u32FromBytes_2", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mockApp: Saito = {};
    const binary = new saito.binary(mockApp);
    const value = 2288066026;
    const buffer = binary.u32AsBytes(value);
    const new_value = binary.u32FromBytes(buffer);
    expect(value).toEqual(new_value);
    expect(value.toString()).toEqual(new_value.toString());
});
test("timestamp check", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mockApp: Saito = {};
    const binary = new saito.binary(mockApp);
    const tested = BigInt(1638670605802);
    const testbytes = binary.u64AsBytes(tested.toString());
    const recreated = binary.u64FromBytes(testbytes);

    expect(tested).toEqual(recreated);
});
