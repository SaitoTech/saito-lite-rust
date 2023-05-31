export default async (saito) => {wa
  if (!saito.BROWSER) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const blake3 = require("blake3");
    saito.hash = (data) => {
      return blake3.hash(data).toString("hex");
    };
  } else {
    const blake3 = await import("blake3/browser");
    saito.hash = (data) => {
      // console.log(blake3);
      // console.log(data);
      return blake3.hash(data).toString("hex");
    };

  }
};
