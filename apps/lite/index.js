import { Saito } from '../core/index'
import mods_config from '../../config/modules.config';

console.log("about to start!");

async function init() {
console.log("HERE WE GO! 1");
  let saito = new Saito({ mod_paths: mods_config.lite });
console.log("HERE WE GO! 2");
  saito.BROWSER = 1;
console.log("HERE WE GO! 3");
  await saito.init();
console.log("HERE WE GO! 4");
}
console.log("about to start!");
init();
