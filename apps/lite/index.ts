import { Saito } from "../core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mods_config from "../../config/modules.config";
// import SaitoJs from "saito-wasm";
async function init() {
  console.log("browser loading saito-wasm");
  await import("saito-wasm/dist/browser").then((sss) => {
    console.log("sss : ", sss);
  });
  // let s = SaitoWasm.get_public_key();
  // console.log("result = ", s);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // let SaitoInst = await SaitoWasm.default;
  // console.log("SaitoInst : ", SaitoInst);
  // await SaitoWasm.initialize();
  // // await SaitoJs.initialize();
  // console.log("33333");
  // let ins = Saito.getInstance();
  // console.log("44444");
  // setInterval(async () => {
  //   //@ts-ignore
  //   // let SaitoWasm = await import(/* webpackMode: "eager" */ "saito-wasm/dist/browser/index");
  //   console.log("SaitoWasm : ", SaitoWasm);
  // }, 1000);
  const saito = new Saito({ mod_paths: mods_config.lite });
  saito.BROWSER = 1;
  await saito.init();
  console.log("bbbbbbbbbbbbb");
}

// init();
window.onload = function () {
  init().then(() => {
    console.log("initiated");
  });
};
