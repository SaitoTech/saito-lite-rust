import { Saito } from '../../apps/core';
import Peer from './peer';
import Transaction from './transaction';
import path from 'path';
import fs from 'fs';
import ws from 'ws';
import { parse } from 'url';
import { fromBase58 } from 'saito-js/lib/util';
// @ts-ignore
//import { DYN_MOD_WEB,DYN_MOD_NODE } from '../dyn_mod';
import SaitoBlock from 'saito-js/lib/block';

class Mods {
  public app: Saito;
  public mods: any;
  public uimods: any;
  public mods_list: any;
  public is_initialized: any;
  public lowest_sync_bid: any;
  public app_filter_func: any;
  public core_filter_func: any;

  constructor(app: Saito, config) {
    this.app = app;
    this.mods = [];
    this.app_filter_func = []; // moderation functions -- app-specific
    this.core_filter_func = []; // core moderation functions (general whitelist / blacklsit)
    this.uimods = [];
    this.mods_list = config;
    this.is_initialized = false;
    this.lowest_sync_bid = -1;

    if (typeof window !== 'undefined') {
      // window.saitoJs = require('saito-js');
    }
  }

  isModuleActive(modname = '') {
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
    //console.log('IN MODULE.TS AFFIX CALLBACKS: ');

    let core_accepts = 0;

    //
    // no callbacks on type=9 spv stubs
    //
    if (tx.type == 5) {
      return;
    }

    core_accepts = this.moderateCore(tx);

    for (let i = 0; i < this.mods.length; i++) {
      // if (!!message && message.module != undefined) {
      if (this.mods[i].shouldAffixCallbackToModule(message?.module || '', tx) == 1) {
        //
        // module-level moderation can OVERRIDE the core moderation which
        // is why we check module-level moderation here and permit the mod
        // to handlePeerTransaction() if mod_accepts even if core does not
        //
        let mod_accepts = this.moderateModule(tx, this.mods[i]);
        if (mod_accepts == 1 || (mod_accepts == 0 && core_accepts != -1)) {
          callbackArray.push(this.mods[i].onConfirmation.bind(this.mods[i]));
          callbackIndexArray.push(txindex);
        }      
      }
    }

    // A bit of a hack to connect the ghost SaitoCrypto (from Wallet) into processing TXs on chain (for info!)
    if (message?.module == "Saito" && this.app.wallet?.saitoCrypto) {
      callbackArray.push(this.app.wallet.saitoCrypto.onConfirmation.bind(this.app.wallet.saitoCrypto));
      callbackIndexArray.push(txindex);
    }
  }

  async handlePeerTransaction(
    tx: Transaction,
    peer: Peer,
    mycallback: (any) => Promise<void> = null
  ) {
    let have_responded = false;
    let request = '';
    let core_accepts = 0;
    let txmsg = tx.returnMessage();

    try {
      request = txmsg?.request;

      core_accepts = this.moderateCore(tx);

      if (txmsg?.request === 'software-update') {
        let receivedBuildNumber = JSON.parse(tx.msg.data).build_number;
        let active_mod = this.app.modules.returnActiveModule();
        // check if not inside game
        if (!active_mod.game) {
          this.app.browser.updateSoftwareVersion(receivedBuildNumber);
        }
      }
    } catch (err) {}

    for (let iii = 0; iii < this.mods.length; iii++) {
      try {
        //
        // module-level moderation can OVERRIDE the core moderation which
        // is why we check module-level moderation here and permit the mod
        // to handlePeerTransaction() if mod_accepts even if core does not
        //
        let mod_accepts = this.moderateModule(tx, this.mods[iii]);
        if (mod_accepts == 1 || (mod_accepts == 0 && core_accepts != -1)) {
          if (await this.mods[iii].handlePeerTransaction(this.app, tx, peer, mycallback)) {
            have_responded = true;
          }
        }
      } catch (err) {
        console.error(`handlePeerTransaction Unknown Error in ${this.mods[iii].name}: `, err);
      }
    }
    if (have_responded == false) {
      if (mycallback) {
        //
        // callback is defined in apps/lite/index.ts
        // it runs sendApiSuccess() with the response object
        //
        mycallback({});
      }
    }
  }

  async initialize() {
    try {
      if (this.app.BROWSER === 1) {

        let mods = await this.app.storage.loadLocalApplications();

        if (mods.length > 0) {

          console.log('loaded mods:', mods);

          self['saito-js'] = require('saito-js').default;
          self['saito-js/lib/slip'] = require('saito-js/lib/slip').default;
          self['saito-js/lib/transaction'] = require('saito-js/lib/transaction').default;
          self['saito-js/lib/block'] = require('saito-js/lib/block').default;

          for (let i = 0; i < mods.length; i++) {
            let mod_binary = mods[i]['binary'];
            let moduleCode = this.app.crypto.base64ToString(mod_binary);

            console.log('moduleCode:', moduleCode);

            let mod = eval(moduleCode);
            console.log('mod : ', typeof mod);
            // @ts-ignore
            let m = new window.Dyn(this.app);
            const current_url = window.location.toString();
            const myurl = new URL(current_url);
            const myurlpath = myurl.pathname.split('/');

            let active_module = myurlpath[1] ? myurlpath[1].toLowerCase() : '';
            if (active_module == '') {
              active_module = 'website';
            }
            if (m.isSlug(active_module)) {
              m.browser_active = true;
              m.alerts = 0;
              const urlParams = new URLSearchParams(location.search);

              m.handleUrlParams(urlParams);
            }

	    for (let z = 0; z < this.mods.length; z++) {
	      if (this.mods[z].name === m.name && !m.teaser) { this.mods.splice(z, 1); }
	    }
            this.mods.push(m);
          }
        }
      } else {
        // console.log('loading dyn module...');
        // let moduleCode = this.app.crypto.base64ToString(DYN_MOD_NODE);
        // //console.log("module code: ", moduleCode);
        // global["saito-js"] = require('saito-js/saito').default;
        // global["saito-js/lib/slip"] = require("saito-js/lib/slip").default;
        // global["saito-js/lib/transaction"] = require("saito-js/lib/transaction").default;
        // global["saito-js/lib/block"]=require("saito-js/lib/block").default;
        // let mod = eval(moduleCode);
        // //console.log("mod eval: ", mod);
        // //console.log("mod : ",typeof mod);
        // // @ts-ignore
        // let m = new global.Dyn(this.app);
        // console.log("m: ", m);
        // this.mods.push(m);
      }
    } catch (error) {
      console.error('failed loading dynamic mod');
      console.error(error);
    }

    let module_removed = 0;

    if (this.app.options) {
      if (this.app.options.modules) {
        for (let i = this.app.options.modules.length - 1; i >= 0 ; i--) {
          let found = 0;
          for (let z = 0; z < this.mods.length; z++) {
            
            if (this.mods[z].name === this.app.options.modules[i].name) {
              found = 1;

              //
              // remove any disabled / inactive modules from this.mods
              //
              if (this.app.options.modules[i].active == 0) {
                console.log("Splice inactive module");
                this.mods.splice(z, 1);
              }

              break;
            }
          }

          //
          // remove cruft from options.modules if they aren't installed
          //
          if (!found){
            module_removed = 1;
            console.log("Splice missing module");
            this.app.options.modules.splice(i, 1);
          }
        }
      }
    }

    //
    // install any new modules
    //
    let new_mods_installed = 0;

    if (!this.app.options.modules) {
      this.app.options.modules = [];
    }

    //
    // This block of code appears deprecated -- we don't really have a situation where
    // modules have the installed flag set to 0
    //
    for (let i = 0; i < this.mods.length; i++) {
      //make sure slugs are defined
      this.mods[i].returnSlug();

      let mi_idx = -1;
      let install_this_module = 1;

      //
      // We don't need to install this.mods[i] if that module
      // exists in app.options.modules and is marked as installed
      //
      for (let j = 0; j < this.app.options.modules.length; j++) {
        if (this.mods[i].name == this.app.options.modules[j].name) {
          if (this.app.options.modules[j].installed) {
            install_this_module = 0;
          }
          mi_idx = j;
        }
      }

      if (install_this_module == 1) {
        new_mods_installed++;

        await this.mods[i].installModule(this.app);

        if (mi_idx != -1) {
          //Update module in app.options.modules
          this.app.options.modules[mi_idx].installed = 1;
          this.app.options.modules[mi_idx].active = 1;

          if (!this.app.options.modules[mi_idx]?.version) {
            this.app.options.modules[mi_idx].version = '';
          }
          if (!this.app.options.modules[mi_idx]?.publisher) {
            this.app.options.modules[mi_idx].publisher = '';
          }
        } else {
          //Add module to app.options.modules
          this.app.options.modules.push({
            name: this.mods[i].name,
            installed: 1,
            version: '',
            publisher: '',
            active: 1
          });
        }
      }
    }

    this.app.options.modules.sort((a, b) => {
        if (a.active && !b.active){
            return -1;
        }
        if (b.active && !a.active){
            return 1;
        }

        if (a.name.toLowerCase() < b.name.toLowerCase()){
            return -1;
        }
        if (a.name.toLowerCase() > b.name.toLowerCase()){
            return 1;
        }
        return 0;
    })


    if (new_mods_installed > 0 || module_removed) {
        // and save

        this.app.storage.saveOptions();
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
    // ... setup moderation / filter functions
    //
    for (let xmod of this.app.modules.respondTo('saito-moderation-app')) {
      this.app_filter_func.push(xmod.respondTo('saito-moderation-app').filter_func);
    }
    for (let xmod of this.app.modules.respondTo('saito-moderation-core')) {
      this.core_filter_func.push(xmod.respondTo('saito-moderation-core').filter_func);
    }

    //
    // initialize the modules
    //
    let module_name = '';

    try {
      for (let i = 0; i < this.mods.length; i++) {
        module_name = this.mods[i].name;
        await this.mods[i].initialize(this.app);
      }
    } catch (err) {
      console.error('Failing module: ' + module_name);
      throw new Error(err);
    }

    const onPeerHandshakeComplete = this.onPeerHandshakeComplete.bind(this);
    const onStunPeerDisconnected = this.onStunPeerDisconnected.bind(this);
    // include events here
    this.app.connection.on('handshake_complete', async (peerIndex: bigint) => {
      if (this.app.BROWSER) {
        // broadcasts my keylist to other peers
        await this.app.wallet.setKeyList(this.app.keychain.returnWatchedPublicKeys());
      }
      // await this.app.network.propagateServices(peerIndex);
      let peer = await this.app.network.getPeer(BigInt(peerIndex));
      if (this.app.BROWSER == 0) {
        let data = `{"build_number": "${this.app.build_number}"}`;
        console.info(data);
        this.app.network.sendRequest('software-update', data, null, peer);
      }
      console.log('handshake complete');
      await onPeerHandshakeComplete(peer);
    });

    this.app.connection.on('stun peer connect', async (peerIndex) => {
      let peer = await this.app.network.getPeer(BigInt(peerIndex));
      await onPeerHandshakeComplete(peer);
    });

    this.app.connection.on('stun peer disconnect', async (peerIndex, publicKey) => {
      await onStunPeerDisconnected(peerIndex, publicKey);
      console.log('peer handshake completed for peer', peerIndex);
    });

    const onConnectionUnstable = this.onConnectionUnstable.bind(this);
    this.app.connection.on('peer_disconnect', async (peerIndex: bigint, public_key: string) => {
      console.log(
        'connection dropped -- triggering on connection unstable : ' + peerIndex,
        ' key : ',
        public_key
      );
      this.onConnectionUnstable(public_key);
    });

    this.app.connection.on('peer_connect', async (peerIndex: bigint) => {
      console.log('peer_connect received for : ' + peerIndex);
      let peer = await this.app.network.getPeer(peerIndex);
      this.onConnectionStable(peer);
    });

    this.is_initialized = true;

    //deprecated as build number now an app property
    if (this.app.BROWSER === 0) {
      //await this.app.modules.getBuildNumber();
    }

    //
    // .. and setup active module
    //
    if (this.app.BROWSER && this.app.browser.multiple_windows_active == 0) {
      await this.app.modules.render();
      await this.app.modules.attachEvents();
    }
  }

  //
  // 1 = permit, -1 = do not permit, 0 = indifferent
  //
  moderateModule(tx = null, mod = null) {
    if (mod == null || tx == null) {
      return 0;
    }

    for (let z = 0; z < this.app_filter_func.length; z++) {
      let permit_through = this.app_filter_func[z](mod, tx);
      if (permit_through == 1) {
        return 1;
      }
      if (permit_through == -1) {
        return -1;
      }
    }

    return 0;
  }

  //
  // 1 = permit, -1 = do not permit
  //
  moderateCore(tx = null) {
    if (tx == null) {
      return 0;
    }

    for (let z = 0; z < this.core_filter_func.length; z++) {
      let permit_through = this.core_filter_func[z](tx);
      if (permit_through == 1) {
        return 1;
      }
      if (permit_through == -1) {
        return -1;
      }
    }
    return 0;
  }

  moderateAddress(publickey = '') {
    let newtx = new Transaction();
    newtx.addFrom(publickey);
    return this.moderate(newtx);
  }

  //
  // return 1 if we permit or do not block
  //
  // 1 if (yes)
  // -1 if (no)
  // 0 if unsure
  //
  moderate(tx = null, app = '') {
    let permit_through = 0;

    //
    // if there is a relevant app-filter-function, respect it
    //
    for (let i = 0; i < this.mods.length; i++) {
      if (this.mods[i].name == app || app == '*') {
        permit_through = this.moderateModule(tx, this.mods[i]);
        if (permit_through == -1) {
          return -1;
        }
        if (permit_through == 1) {
          return 1;
        }
      }
    }

    //
    // otherwise go through blacklist
    //
    permit_through = this.moderateCore(tx);

    if (permit_through == -1) {
      return -1;
    }
    if (permit_through == 1) {
      return 1;
    }

    //
    // we don't know, so return 0;
    //
    return 0;
  }


  async render() {
    for (let icb = 0; icb < this.mods.length; icb++) {
      if (this.mods[icb].browser_active == 1) {
        await this.mods[icb].render(this.app, this.mods[icb]);
      }
    }
    this.app.connection.emit('saito-render-complete');
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

  //
  // respondTo returns Object, Array or null
  //
  getRespondTos(request, obj = null) {
    const compliantInterfaces = [];
    for (const mod of this.mods) {
      const itnerface = mod.respondTo(request, obj);
      if (itnerface != null) {
        if (Object.keys(itnerface)) {
          compliantInterfaces.push({
            ...itnerface,
            modname: mod.returnName()
          });
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
    return null;
  }

  onNewBlock(blk, i_am_the_longest_chain) {
    console.log('#################');
    console.log('### New Block ### ' + blk.id);
    console.log('#################');
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

  onConnectionUnstable(public_key) {
    for (let i = 0; i < this.mods.length; i++) {
      this.mods[i].onConnectionUnstable(this.app, public_key);
    }
  }

  onStunPeerDisconnected(peer_index, public_key) {
    for (let i = 0; i < this.mods.length; i++) {
      this.mods[i].onStunPeerDisconnected(this.app, peer_index, public_key);
    }
  }

  async onUpgrade(type, privatekey, walletfile) {
    for (let i = 0; i < this.mods.length; i++) {
      await this.mods[i].onUpgrade(type, privatekey, walletfile);
    }
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

  async onWebSocketServer(webserver) {
    for (let i = 0; i < this.mods.length; i++) {
      let mod = this.mods[i];
      let path = mod.getWebsocketPath();
      if (!path) {
        continue;
      }
      console.log('creating websocket server for module :' + mod.name + ' on path : ' + path);
      let wss = new ws.WebSocketServer({
        noServer: true,
        // todo : check if the path is already being used or reserved?
        path: '/' + path
      });
      webserver.on('upgrade', (request: any, socket: any, head: any) => {
        const parsedUrl = parse(request.url);
        const pathname = parsedUrl.pathname;
        const pathParts = pathname.split('/').filter(Boolean);
        const subdirectory = pathParts.length > 0 ? pathParts[0] : null;
        if (subdirectory === path) {
          console.debug('connection on module : ' + mod.name + ' upgrade ----> ' + request.url);
          wss.handleUpgrade(request, socket, head, (websocket: any) => {
            console.log('handling upgrade ///');
            wss.emit('connection', websocket, request);
          });
        }
      });

      mod.onWebSocketServer(wss);
    }
  }

  /*
  async getBuildNumber() {
    for (let i = 0; i < this.mods.length; i++) {
      await this.mods[i].getBuildNumber()
    }
  }
  */
}

export default Mods;
