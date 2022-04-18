import { Saito } from "../core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mods_config from "../../config/modules.config";
// import SaitoJs from "saito-wasm";
async function init() {
  console.log("aaaaaaaaaaaaa");
  let SaitoWasm = await import("saito-wasm");
  console.log("SaitoWasm : ", SaitoWasm);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let SaitoInst = await SaitoWasm.default;
  console.log("SaitoInst : ", SaitoInst);
  await SaitoInst.initialize();
  // await SaitoJs.initialize();
  console.log("33333");
  // let ins = Saito.getInstance();
  // console.log("44444");
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
