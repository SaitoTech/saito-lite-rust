// import blake3 from "blake3-js";
//// eslint-disable-next-line @typescript-eslint/no-var-requires
// const blake3 = require("blake3-js");

export default async (saito) => {
  if (!saito.BROWSER) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const blake3 = require("blake3");
    // const blake3 = await import ("blake3");
    saito.hash = (data) => {
      return blake3.hash(data).toString("hex");
    };
  } else {
    console.log("loading blake3");
    const blake3 = await import(/* webpackMode: "eager" */ "blake3-js");
    console.log("blake3 : ", blake3);
    // import('blake3/browser').then(blake3 => {
    //     saito.hash = (data) => {
    //         return blake3.hash(data).toString('hex');
    //     };
    // });
    // let blake3 = await import(/* webpackMode: "eager" */'blake3/browser');
    // let blake3 = await load.default(undefined);
    // saito.hash = (data) => {
    //     return blake3.hash(data).toString('hex');
    // };
    saito.hash = (data) => {
      return blake3.default.newRegular().update(data).finalize();
    };
  }
};
