import { Saito } from "../../apps/core";
import Peer from "./peer";
import Transaction from "./transaction";
import path from "path";
import fs from 'fs'

class Mods {
  public app: Saito;
  public mods: any;
  public uimods: any;
  public mods_list: any;
  public is_initialized: any;
  public lowest_sync_bid: any;

  constructor(app: Saito, config) {
    this.app = app;
    this.mods = [];
    this.uimods = [];
    this.mods_list = config;
    this.is_initialized = false;
    this.lowest_sync_bid = -1;
  }

  isModuleActive(modname = "") {
    for (let i = 0; i < this.mods.length; i++) {
      if (this.mods[i].browser_active == 1) {
        if (modname == this.mods[i].name) {
          return 1;
        }
      }
    }
    return 0;
  }

  returnActiveModule() {
    for (let i = 0; i < this.mods.length; i++) {
      if (this.mods[i].browser_active == 1) {
        return this.mods[i];
      }
    }
    return null;
  }

  attachEvents() {
    for (let imp = 0; imp < this.mods.length; imp++) {
      if (this.mods[imp].browser_active == 1) {
        this.mods[imp].attachEvents(this.app);
      }
    }
    return null;
  }

  affixCallbacks(tx, txindex, message, callbackArray, callbackIndexArray) {
    //
    // no callbacks on type=9 spv stubs
    //
    if (tx.type == 5) {
      return;
    }

    for (let i = 0; i < this.mods.length; i++) {
      // if (!!message && message.module != undefined) {
      if (this.mods[i].shouldAffixCallbackToModule(message?.module || "", tx) == 1) {
        callbackArray.push(this.mods[i].onConfirmation.bind(this.mods[i]));
        callbackIndexArray.push(txindex);
      }
    }
  }

  async handlePeerTransaction(
    tx: Transaction,
    peer: Peer,
    mycallback: (any) => Promise<void> = null
  ) {


    let have_responded = false;
    let request = "";
    try {
      let txmsg = tx.returnMessage();
      request = txmsg?.request;

      if (txmsg?.request === "software-update") {
        console.log('resetting software');
      }

    } catch (err) { }




    for (let iii = 0; iii < this.mods.length; iii++) {
      //console.log(`peer request (${request}), hpt into... ` + this.mods[iii].name);
      try {
        if (await this.mods[iii].handlePeerTransaction(this.app, tx, peer, mycallback)) {
          have_responded = true;
        }
      } catch (err) {
        console.error(`handlePeerTransaction Unknown Error in ${this.mods[iii].name}: `, err);
      }
    }
    if (have_responded == false) {
      if (mycallback) {
        console.log("Execute null callback on " + request);
        mycallback({});
      }
    }
  }

  async initialize() {

    // function watchBuildFile(app) {
    //   const filePath = path.join(__dirname, 'config/options');

    //   fs.watch('config/options', (eventType, filename) => {
    //     if (filename) {
    //       console.log(`options was modified: ${eventType}`);
    //       checkBuildNumber(app);
    //     }
    //   });
    // }

    if (this.app.BROWSER === 0) {
      // watchBuildFile(this.app)
    }


    function checkBuildNumber(app) {
      path
      const filePath = path.join(__dirname, 'config/options');
      fs.readFile('config/options', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading options file:', err);
          return;
        }
        try {
          const jsonData = JSON.parse(data);
          const buildNumber = BigInt(jsonData.build_number);
          app.connection.emit("new_software_version_detected", buildNumber)
          // const buffer = Buffer.alloc(33);
          // buffer[0] = 7;
          // for (let i = 0; i < 32; i++) {
          //   buffer[32 - i] = Number((buildNumber >> BigInt(i * 8)) & BigInt(0xFF));
          // }
          // socket.send(buffer);
        } catch (e) {
          console.error('Error parsing JSON from options file:', e);
        }
      });
    }


    //
    // remove any disabled / inactive modules
    //
    if (this.app.options) {
      if (this.app.options.modules) {
        for (let i = 0; i < this.app.options.modules.length; i++) {
          if (this.app.options.modules[i].active == 0) {
            for (let z = 0; z < this.mods.length; z++) {
              if (this.mods[z].name === this.app.options.modules[i].name) {
                this.mods.splice(z, 1);
                z = this.mods.length + 1;
              }
            }
          }
        }
      }
    }

    //
    // install any new modules
    //
    let new_mods_installed = 0;
    let start_installation = 0;
    if (this.app.options.modules == null) {
      start_installation = 1;
      this.app.options.modules = [];
    } else {
      if (this.app.options.modules.length < this.mods.length) {
        start_installation = 1;
      }
    }
    if (start_installation || true) {
      for (let i = 0; i < this.mods.length; i++) {
        let mi = 0;
        let mi_idx = -1;
        let install_this_module = 0;

        for (let j = 0; j < this.app.options.modules.length; j++) {
          if (this.mods[i].name == this.app.options.modules[j].name) {
            mi = 1;
            mi_idx = j;
          }
        }
        if (mi == 0) {
          install_this_module = 1;
        } else {
          if (this.app.options.modules[mi_idx].installed == 0) {
            install_this_module = 1;
          }
        }

        if (install_this_module == 1) {
          new_mods_installed = 1;
          await this.mods[i].installModule(this.app);
          if (mi_idx != -1) {
            this.app.options.modules[mi_idx].installed = 1;
            if (this.app.options.modules[mi_idx].version == undefined) {
              this.app.options.modules[mi_idx].version == "";
            }
            if (this.app.options.modules[mi_idx].publisher == undefined) {
              this.app.options.modules[mi_idx].publisher == "";
            }
            this.app.options.modules[mi_idx].active = 1;
          } else {
            this.app.options.modules.push({
              name: this.mods[i].name,
              installed: 1,
              version: "",
              publisher: "",
              active: 1,
            });
          }
        }
      }
      if (new_mods_installed == 1) {
        this.app.storage.saveOptions();
      }
    }

    const modNames = {};
    this.mods.forEach((mod, i) => {
      if (modNames[mod.name]) {
        console.log(`*****************************************************************`);
        console.log(`***** WARNING: mod ${mod.name} is installed more than once! *****`);
        console.log(`*****************************************************************`);
      }
      modNames[mod.name] = true;
    });

    //
    // browsers install UIMODs
    //
    if (this.app.BROWSER == 1) {
      for (let i = 0; i < this.uimods.length; i++) {
        this.mods.push(this.uimods[i]);
      }
    }

    //
    // initialize the modules
    //
    let module_name = "";

    try {
      for (let i = 0; i < this.mods.length; i++) {
        module_name = this.mods[i].name;
        await this.mods[i].initialize(this.app);
      }
    } catch (err) {
      console.error("Failing module: " + module_name);
      throw new Error(err);
    }

    const onPeerHandshakeComplete = this.onPeerHandshakeComplete.bind(this);
    // include events here
    this.app.connection.on("handshake_complete", async (peerIndex: bigint) => {
      // await this.app.network.propagateServices(peerIndex);
      let peer = await this.app.network.getPeer(BigInt(peerIndex));
      console.log("handshake complete");
      await onPeerHandshakeComplete(peer);
    });

    const onConnectionUnstable = this.onConnectionUnstable.bind(this);
    this.app.connection.on("peer_disconnect", async (peerIndex: bigint) => {
      console.log("connection dropped -- triggering on connection unstable : " + peerIndex);
      // // todo : clone peer before disconnection and send with event
      // let peer = await this.app.network.getPeer(BigInt(peerIndex));
      // onConnectionUnstable(peer);
    });

    this.app.connection.on("peer_connect", async (peerIndex: bigint) => {
      console.log("peer_connect received for : " + peerIndex);
      let peer = await this.app.network.getPeer(peerIndex);
      this.onConnectionStable(peer);
    });

    this.app.connection.on("new_software_version_detected", async (peerIndex: bigint, version) => {
      console.log("new version detected " + peerIndex, version);
    });

    this.is_initialized = true;

    //
    // .. and setup active module
    //
    if (this.app.BROWSER) {
      await this.app.modules.render();
      // deprecate initializeHTML but make sure all render functions call attachEvents
      await this.app.modules.initializeHTML();
      await this.app.modules.attachEvents();
    }

  }

  async render() {
    console.log("modules.render");
    for (let icb = 0; icb < this.mods.length; icb++) {
      if (this.mods[icb].browser_active == 1) {
        console.log("mod.render : " + this.mods[icb].name);

        await this.mods[icb].render(this.app, this.mods[icb]);
      }
    }
    return null;
  }

  async initializeHTML() {
    for (let icb = 0; icb < this.mods.length; icb++) {
      if (this.mods[icb].browser_active == 1) {
        await this.mods[icb].initializeHTML(this.app);
      }
    }
    return null;
  }

  async renderInto(qs) {
    for (const mod of this.mods) {
      await mod.renderInto(qs);
    }
  }

  returnModulesRenderingInto(qs) {
    return this.mods.filter((mod) => {
      return mod.canRenderInto(qs) != false;
    });
  }

  returnModulesRespondingTo(request, obj = null) {
    let m = [];
    for (let mod of this.mods) {
      if (mod.respondTo(request, obj) != null) {
        m.push(mod);
      }
    }
    return m;
  }

  respondTo(request, obj = null) {
    let m = [];
    for (let mod of this.mods) {
      if (mod.respondTo(request, obj) != null) {
        m.push(mod);
      }
    }
    return m;
  }

  getRespondTos(request, obj = null) {
    const compliantInterfaces = [];
    for (const mod of this.mods) {
      const itnerface = mod.respondTo(request, obj);
      if (itnerface != null) {
        if (Object.keys(itnerface)) {
          compliantInterfaces.push({ ...itnerface, modname: mod.returnName() });
        }
      }
    }
    return compliantInterfaces;
  }

  returnModulesBySubType(subtype) {
    const mods = [];
    this.mods.forEach((mod) => {
      if (mod instanceof subtype) {
        mods.push(mod);
      }
    });
    return mods;
  }

  returnFirstModulBySubType(subtype) {
    for (let i = 0; i < this.mods.length; i++) {
      if (this.mods[i] instanceof subtype) {
        return this.mods[i];
      }
    }
    return null;
  }

  returnModulesByTypeName(subtypeName) {
    // TODO: implement if you need this.
  }

  returnFirstModuleByTypeName(subtypeName) {
    // using type name allows us to check for the type without having a
    // reference to it(e.g. for modules which might not be installed). However
    // this technique(constructor.name) will not allow us to check for subtypes.
    for (let i = 0; i < this.mods.length; i++) {
      if (this.mods[i].constructor.name === subtypeName) {
        return this.mods[i];
      }
    }
    return null;
  }

  returnFirstRespondTo(request) {
    for (let i = 0; i < this.mods.length; i++) {
      let result = this.mods[i].respondTo(request);
      if (result) {
        return result;
      }
    }
    throw "Module responding to " + request + " not found";
  }

  onNewBlock(blk, i_am_the_longest_chain) {
    // blk.transactions.forEach(transaction => {
    //   console.log(transaction.toJson(), "new block")
    // })
    console.log("#################");
    console.log("### New Block ### " + blk.id);
    console.log("#################");
    for (let iii = 0; iii < this.mods.length; iii++) {
      this.mods[iii].onNewBlock(blk, i_am_the_longest_chain);
    }
    return;
  }

  onChainReorganization(block_id, block_hash, lc, pos) {
    for (let imp = 0; imp < this.mods.length; imp++) {
      this.mods[imp].onChainReorganization(block_id, block_hash, lc, pos);
    }
    return null;
  }

  async onPeerHandshakeComplete(peer: Peer) {
    //
    // all modules learn about the peer connecting
    //
    for (let i = 0; i < this.mods.length; i++) {
      await this.mods[i].onPeerHandshakeComplete(this.app, peer);
    }
    //
    // then they learn about any services now-available
    //
    for (let i = 0; i < peer.services.length; i++) {
      await this.onPeerServiceUp(peer, peer.services[i]);
    }
  }

  async onPeerServiceUp(peer, service) {
    for (let i = 0; i < this.mods.length; i++) {
      await this.mods[i].onPeerServiceUp(this.app, peer, service);
    }
  }

  onConnectionStable(peer) {
    for (let i = 0; i < this.mods.length; i++) {
      this.mods[i].onConnectionStable(this.app, peer);
    }
  }

  onConnectionUnstable(peer) {
    for (let i = 0; i < this.mods.length; i++) {
      this.mods[i].onConnectionUnstable(this.app, peer);
    }
  }

  async onWalletReset(nuke = false) {
    for (let i = 0; i < this.mods.length; i++) {
      await this.mods[i].onWalletReset(nuke);
    }
    return 1;
  }

  returnModuleBySlug(modslug) {
    for (let i = 0; i < this.mods.length; i++) {
      if (modslug === this.mods[i].returnSlug()) {
        return this.mods[i];
      }
    }
    return null;
  }

  // checks against full name (with spaces too)
  returnModuleByName(modname) {
    for (let i = 0; i < this.mods.length; i++) {
      if (modname === this.mods[i].name || modname === this.mods[i].returnName()) {
        return this.mods[i];
      }
    }
    return null;
  }

  returnModule(modname) {
    for (let i = 0; i < this.mods.length; i++) {
      if (modname === this.mods[i].name) {
        return this.mods[i];
      }
    }
    return null;
  }

  returnModuleIndex(modname) {
    for (let i = 0; i < this.mods.length; i++) {
      if (modname === this.mods[i].name.toLowerCase()) {
        return i;
      }
    }
    return -1;
  }

  updateBlockchainSync(current, target) {
    if (this.lowest_sync_bid == -1) {
      this.lowest_sync_bid = current;
    }
    target = target - (this.lowest_sync_bid - 1);
    current = current - (this.lowest_sync_bid - 1);
    if (target < 1) {
      target = 1;
    }
    if (current < 1) {
      current = 1;
    }
    let percent_downloaded = 100;
    if (target > current) {
      percent_downloaded = Math.floor(100 * (current / target));
    }
    for (let i = 0; i < this.mods.length; i++) {
      this.mods[i].updateBlockchainSync(this.app, percent_downloaded);
    }
    return null;
  }

  webServer(expressapp = null, express = null) {
    for (let i = 0; i < this.mods.length; i++) {
      this.mods[i].webServer(this.app, expressapp, express);
    }
    return null;
  }

  async onUpgrade(type, privatekey, walletfile) {
    for (let i = 0; i < this.mods.length; i++) {
      await this.mods[i].onUpgrade(type, privatekey, walletfile);
    }
  }
}

export default Mods;
