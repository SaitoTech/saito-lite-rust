import { Saito } from "../../apps/core";
import Binary from "./binary";

test("u64FromBytes", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mockApp: Saito = {};
  const binary = new Binary(mockApp);
  const value = BigInt(1637034582666);
  const buffer = binary.u64AsBytes(value.toString());
  const new_value = binary.u64FromBytes(buffer);
  expect(value).toEqual(new_value);
  expect(value.toString()).toEqual(new_value.toString());
});
test("u32FromBytes", () => {
  const mockApp = {};
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const binary = new Binary(mockApp);
  const value = 123456;
  const buffer = binary.u32AsBytes(value);
  const new_value = binary.u32FromBytes(buffer);
  expect(value).toEqual(new_value);
  expect(value.toString()).toEqual(new_value.toString());
});
test("u32FromBytes_2", () => {
  const mockApp = {};
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const binary = new Binary(mockApp);
  const value = 2288066026;
  const buffer = binary.u32AsBytes(value);
  const new_value = binary.u32FromBytes(buffer);
  expect(value).toEqual(new_value);
  expect(value.toString()).toEqual(new_value.toString());
});
test("timestamp check", () => {
  const mockApp = {};
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const binary = new Binary(mockApp);
  const tested = BigInt(1638670605802);
  const testbytes = binary.u64AsBytes(tested.toString());
  const recreated = binary.u64FromBytes(testbytes);

  expect(tested).toEqual(recreated);
});
