// import blake3 from "blake3-js";
//// eslint-disable-next-line @typescript-eslint/no-var-requires
// const blake3 = require("blake3-js");

// import blake3 from "blake3/browser-async";

// import * as b3 from "blake3-wasm/browser-async";

export default async (saito) => {
  if (!saito.BROWSER) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const blake3 = require("blake3");
    saito.hash = (data) => {
      return blake3.hash(data).toString("hex");
    };
  } else {
    const blake3 = await import("blake3/browser");
    // let blake3 = await b.default(undefined);
    saito.hash = (data) => {
      // console.log(blake3);
      // console.log(data);
      return blake3.hash(data).toString("hex");
    };

  }
};
