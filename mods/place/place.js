const Transaction = require("../../lib/saito/transaction").default;
const ModTemplate = require('../../lib/templates/modtemplate');
const PeerService = require("saito-js/lib/peer_service").default;
const PlaceUI     = require('./lib/place-ui');
const GridState   = require('./lib/grid-state');
const createHash  = require('crypto').createHash;
const GameMenu    = require('../../lib/saito/ui/game-menu/game-menu');

class Place extends ModTemplate {
  constructor(app) {
    super(app);
    this.app = app;
    this.name = "Place";

    this.gridSize = 40;

    this.gridState = new GridState(this);
    this.placeUI   = new PlaceUI(this);
    this.menu = new GameMenu(app, this);
  }

  returnServices() {
    return [new PeerService(null, "place", "place tilegrid")];
  }

  async render(app) {
    if (!this.app.BROWSER) {
      return;
    }
    await super.render(app);
    this.placeUI.render();

    this.menu.addMenuOption("game-game", "Menu");
    this.menu.debug = false;
    this.menu.render();
  }

  exitGame() {
    let homeModule = this.app.options.homeModule || "Arcade";
    let mod = this.app.modules.returnModuleByName(homeModule);
    let slug = mod?.returnSlug() || "arcade";
    window.location.href = "/" + slug;
  }


  async onPeerServiceUp(app, peer, service={}) {
    if (!this.browser_active) {
      return;
    }
    if (service.service === "place") {
      this.loadTilegridFromPeer(peer);
    }
  }

  loadTilegridFromPeer(peer) {
    const sql = "SELECT * FROM tiles";
    this.sendPeerDatabaseRequestWithFilter(this.name, sql, (res) => {
      if (res.rows) {
        res.rows.forEach((row) => {
          this.updateTile(
            {i: row.i, j: row.j, color: this.componentsToColor([row.red, row.green, row.blue])},
            "confirmed", row.ordinal
          );
        });
      }
    });
  }

  async handlePeerTransaction(app, newtx=null, peer, mycallback=null) {
    if (newtx === null) { return 0; }
    const message = newtx.returnMessage();
    if (message?.data && message?.request === "place update") {
      if (this.app.BROWSER) {
        const tx = new Transaction(undefined, message.data);
        const txmsg = tx.returnMessage();
        if (txmsg.module === this.name && txmsg.request === "paint") {
          this.publicKey = await this.app.wallet.getPublicKey();
          if (!tx.isFrom(this.publicKey)) {
            console.log("*+* (handlePeerTransaction) Receiving painting transaction...");
            await this.receivePaintingTransaction(tx);
          }
        }
      }
      return 1;
    }
    return super.handlePeerTransaction(app, newtx, peer, mycallback);
  }


  async onConfirmation(blk, tx, conf) {
    console.log("*+* Place.onConfirmation called");
    let txmsg = tx.returnMessage();
    try {
      if (conf == 0) {
        if (txmsg.module === this.name && txmsg.request === "paint") {
          console.log("*+* (onConfirmation) Receiving painting transaction...");
          await this.receivePaintingTransaction(tx);
          if (!this.app.BROWSER) {
            console.log("*+* (onConfirmation) Notifying peers...");
            this.notifyPeers(tx);
          }
        }
      }
    } catch (err) {
      console.error("In " + this.name + ".onConfirmation: " + err);
    }
  }

  async notifyPeers(tx) {
    const peers = await this.app.network.getPeers();
    for (const peer of peers) {
      if (peer.synctype === "lite") {
        this.app.network.sendRequestAsTransaction("place update", tx.toJson(), null, peer.peerIndex);
      }
    }
  }

  async sendPaintingTransaction(paintedTiles) {
    let newtx = await this.app.wallet.createUnsignedTransaction();
    newtx.msg = {module: this.name, request: "paint", data: paintedTiles};
    await newtx.sign();
    await this.app.network.propagateTransaction(newtx);
    return this.transactionOrdinal(newtx);
  }

  async receivePaintingTransaction(tx) {
    const txOrdinal = this.transactionOrdinal(tx);
    await this.updateTiles(tx.returnMessage().data, "confirmed", txOrdinal);
  }

  // orders transactions in case they have tiles in common and timestamps are equal
  transactionOrdinal(tx) {
    const orderPrecision = 10**6;
    const sigHash = parseInt(createHash("md5").update(tx.signature).digest("hex"), 16) % orderPrecision;
    return tx.timestamp * orderPrecision + sigHash;
  }

  async updateTile(tile, status, ordinal=null) {
    await this.updateTiles([tile], status, ordinal)
  }

  async updateTiles(tileArray, status, ordinal=null) {
    const locatedStateArray = [];
    for (const tile of tileArray) {
      locatedStateArray.push(this.gridState.updateTile(tile, status, ordinal));
    }
    if (this.app.BROWSER) {
      for (const locatedState of locatedStateArray) {
        this.placeUI.updateTileRendering(locatedState);
      }
    } else if (status === "confirmed") {
      let i, j, state, components;
      const sqlValues = [], params = {};
      for (let k = 0; k < locatedStateArray.length; k++) {
        sqlValues.push(`($i${k}, $j${k}, $red${k}, $green${k}, $blue${k}, $ordinal${k})`);
        ({i: i, j: j, state: state} = locatedStateArray[k]);
        components = this.colorToComponents(state.confirmed.color);
        params[`$i${k}`] = i;
        params[`$j${k}`] = j;
        params[`$red${k}`]   = components[0];
        params[`$green${k}`] = components[1];
        params[`$blue${k}`]  = components[2];
        params[`$ordinal${k}`] = ordinal;
      }
      console.log(params);
      const sql = "REPLACE INTO tiles (i, j, red, green, blue, ordinal) VALUES\n" + sqlValues.join(",\n");
      await this.app.storage.executeDatabase(sql, params, "place");
    }
  }

  // async updateTiles(tileArray, status, ordinal=null) {
  //   const locatedStateArray = [];
  //   for (const tile of tileArray) {
  //     locatedStateArray.push(this.gridState.updateTile(tile, status, ordinal));
  //   }
  //   if (this.app.BROWSER) {
  //     for (const locatedState of locatedStateArray) {
  //       this.placeUI.updateTileRendering(locatedState);
  //     }
  //   } else if (status === "confirmed") {
  //     let i, j, state, components;
  //     const sqlValues = [];
  //     for (const locatedState of locatedStateArray) {
  //       ({i: i, j: j, state: state} = locatedState);
  //       components = this.colorToComponents(state.confirmed.color);
  //       sqlValues.push(`(${i}, ${j}, ${components[0]}, ${components[1]}, ${components[2]}, ${ordinal})`);
  //     }
  //     const sql = "REPLACE INTO tiles (i, j, red, green, blue, ordinal) VALUES\n" + sqlValues.join(",\n");
  //     await this.app.storage.executeDatabase(sql, {}, "place");
  //   }
  // }

  colorToComponents(color) {
    const hexComponents = [0, 1, 2].map(k => color.substring(2*k+1, 2*k+3));
    return hexComponents.map(hex => parseInt(hex, 16));
  }

  componentsToColor(components) {
    const hexComponents = components.map(c => ((c < 16) ? "0" : "") + c.toString(16));
    return "#" + hexComponents.reduce((strAcc, str) => strAcc + str, "");
  }
}

module.exports = Place;