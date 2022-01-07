import { Saito } from "../core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mods_config from "../../config/modules.config";

async function init() {
  const saito = new Saito({ mod_paths: mods_config.lite });
  saito.BROWSER = 1;
  await saito.init();
}

// init();
window.onload = function () {
  init();
};
