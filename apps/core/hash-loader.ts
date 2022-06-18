// import blake3 from "blake3-js";
//// eslint-disable-next-line @typescript-eslint/no-var-requires
// const blake3 = require("blake3-js");

export default async (saito) => {
  if (!saito.BROWSER) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const blake3 = require("blake3");
    saito.hash = (data) => {
      return blake3.hash(data).toString("hex");
    };
  } else {
    const blake3 = await import(/* webpackMode: "eager" */ "blake3-js");
    saito.hash = (data) => {
      return blake3.default.newRegular().update(data).finalize();
    };
  }
};
