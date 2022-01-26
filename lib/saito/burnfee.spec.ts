import BurnFee from "./burnfee";

test("burnfee routing work needed tests", () => {
  const burnfee = new BurnFee();

  const bf1 = burnfee.returnRoutingWorkNeededToProduceBlockInNolan(
    BigInt(10),
    2 * burnfee.heartbeat,
    0
  );
  const bf2 = burnfee.returnRoutingWorkNeededToProduceBlockInNolan(BigInt(1000000000), 0, 0);
  const bf3 = burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(
    BigInt(100000000),
    burnfee.heartbeat,
    0
  );
  const bf4 = burnfee.returnBurnFeeForBlockProducedAtCurrentTimestampInNolan(
    BigInt(100000000),
    burnfee.heartbeat / 10,
    0
  );
  const bf4out = BigInt(Math.round(100_000_000.0 * Math.sqrt(10.0)));

  expect(bf1.toString()).toEqual(BigInt(0).toString());
  expect(bf2.toString()).toEqual(BigInt(10_000_000_000_000_000_000).toString());
  expect(bf3.toString()).toEqual(BigInt(100_000_000).toString());
  expect(bf4.toString()).toEqual(bf4out.toString());
});
