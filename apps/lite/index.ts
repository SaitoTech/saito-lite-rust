import { Saito } from "../core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mods_config from "../../config/modules.config";
import SaitoJs from "saito-js";
async function init() {
  console.log("aaaaaaaaaaaaa");
  await SaitoJs.initialize();
  console.log("33333");
  let ins = SaitoJs.getInstance();
  console.log("44444");
  const saito = new Saito({ mod_paths: mods_config.lite });
  saito.BROWSER = 1;
  await saito.init();
  console.log("bbbbbbbbbbbbb");
}

// init();
window.onload = function () {
  init();
};
