const PeerService  = require("saito-js/lib/peer_service").default;
const Transaction  = require("../../lib/saito/transaction").default;
const GameMenu     = require("../../lib/saito/ui/game-menu/game-menu");
const ModTemplate  = require("../../lib/templates/modtemplate");
const GraffitiUI   = require("./lib/graffiti-ui");
const GridState    = require("./lib/grid-state");
const graffitiHTML = require("./index");
const createHash   = require("crypto").createHash;
const cookieParser = require("cookie-parser");
const path = require("path");
const fs   = require("fs").promises;

class Graffiti extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Graffiti";
    this.slug = "graffiti";

    this.gridSize = 200;
    this.blankTileColor = "#ffffff";
    this.txOrderPrecision = 6;

    this.gridState = new GridState(this);
    this.menu = new GameMenu(app, this);
  }

  async initialize(app) {
    await super.initialize(app);
    if (!this.app.BROWSER) {
      await this.loadGridFromDatabase();
    }
  }

  returnServices() {
    return [new PeerService(null, "graffiti", "graffiti tilegrid")];
  }

  async onPeerServiceUp(app, peer, service={}) {
    if (!this.browser_active) {
      return;
    }
    if (service.service === "graffiti") {
      await this.loadGridFromPeer(peer);
    }
  }

  async loadGridFromDatabase() {
    const sql = `SELECT * FROM tiles WHERE i < ${this.gridSize} AND j < ${this.gridSize}`;
    const rows = await this.app.storage.queryDatabase(sql, {}, "graffiti");
    for (const row of rows) {
      this.gridState.updateTile(
        {i: row.i, j: row.j, color: this.componentsToColor([row.red, row.green, row.blue])},
        "confirmed", row.ordinal
      );
    }
  }

  async loadGridFromPeer(peer) {
    const sql = `SELECT * FROM tiles WHERE i < ${this.gridSize} AND j < ${this.gridSize}`;
    this.sendPeerDatabaseRequestWithFilter(this.name, sql, async (res) => {
      if (res.rows) {
        for (const row of res.rows) {
          await this.updateTile(
            {i: row.i, j: row.j, color: this.componentsToColor([row.red, row.green, row.blue])},
            "confirmed", row.ordinal
          );
        }
      }
    });
  }

  async render(app) {
    if (!this.app.BROWSER) {
      return;
    }
    await super.render(app);
    this.graffitiUI = new GraffitiUI(this);
    this.graffitiUI.render();

    this.menu.addMenuOption("game-game", "Menu");
    this.menu.debug = false;
    this.menu.render();
  }

  exitGame() {
    const homeModule = this.app.options.homeModule || "RedSquare";
    const mod = this.app.modules.returnModuleByName(homeModule);
    const slug = mod?.returnSlug() || "redsquare";
    window.location.href = "/" + slug;
  }



  async handlePeerTransaction(app, newtx=null, peer, mycallback=null) {
    if (newtx === null) { return 0; }
    const message = newtx.returnMessage();
    if (message?.data && message?.request === "graffiti update") {
      // We can ignore rebroadcast transactions if we aren't in the graffiti space
      // because we will fetch the up to date one on load
      if (this.app.BROWSER && this.browser_active) {
        const tx = new Transaction(undefined, message.data);
        const txmsg = tx.returnMessage();
        if (txmsg.module === this.name && txmsg.request === "paint") {
          this.publicKey = await this.app.wallet.getPublicKey();
          if (!tx.isFrom(this.publicKey)) {
            await this.receivePaintingTransaction(tx);
          }
        }
      }
      return 1;
    }
    return super.handlePeerTransaction(app, newtx, peer, mycallback);
  }

  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();
    try {
      if (conf == 0) {
        if (txmsg.module === this.name && txmsg.request === "paint") {
          await this.receivePaintingTransaction(tx);
          if (!this.app.BROWSER) {
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
        this.app.network.sendRequestAsTransaction("graffiti update", tx.toJson(), null, peer.peerIndex);
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

  // Orders transactions in case they have tiles in common and timestamps are equal.
  transactionOrdinal(tx) {
    const sigHash = parseInt(createHash("md5").update(tx.signature).digest("hex"), 16) % (10 ** this.txOrderPrecision);
    return tx.timestamp * (10 ** this.txOrderPrecision) + sigHash;
  }



  webServer(app, expressapp, express) {
    this.webdir = path.normalize(`${__dirname}/../../mods/${this.dirname}/web`);

    this.handleSnapshots();

    expressapp.use(cookieParser());

    expressapp.get("/" + encodeURI(this.slug), (req, res) => {
      const lastSnapshotPath = (this.lastSnapshotFileName !== null) ?
        `${this.snapshotsDirSubpath}/${this.lastSnapshotFileName}` : null;

      const isFirstTime = !req.cookies.notFirstTime;
      if (isFirstTime) {
        res.cookie("notFirstTime", 1, {maxAge: 10**12, httpOnly: true, secure: true});
      }

      res.setHeader("Content-type", "text/html");
      res.charset = "UTF-8";
      res.send(graffitiHTML(app.build_number, this.slug, lastSnapshotPath, isFirstTime));
    });

    expressapp.use("/" + encodeURI(this.slug), express.static(this.webdir));
  }

  // Creates a new snapshot every 60 seconds.
  // Deletes the previous snapshot 30 seconds after the new one is created.
  async handleSnapshots() {
    this.Jimp = require("jimp");

    this.snapshotsDirSubpath = "img/snapshots";
    this.snapshotUpdatingInterval = 60;
    this.creationDeletionInterval = this.snapshotUpdatingInterval / 2;
    this.snapshotWidth = 900;

    this.deletionCreationInterval = this.snapshotUpdatingInterval - this.creationDeletionInterval;
    this.snapshotHeight = Math.round(this.snapshotWidth / 2);
    try {
      await this.clearSnapshotsDirectory();
      await this.loopSnapshots();
    } catch (err) {
      console.error("Error handling snapshot files:", err);
    }
  }

  async clearSnapshotsDirectory() {
    const snapshotDirPath = `${this.webdir}/${this.snapshotsDirSubpath}`;
    await fs.mkdir(snapshotDirPath, {recursive: true});

    const snapshotFileNames = await fs.readdir(snapshotDirPath);
    for (const snapshotFileName of snapshotFileNames) {
      await fs.unlink(path.join(snapshotDirPath, snapshotFileName));
    }
  }

  async loopSnapshots(oldSnapshotFilePath=null) {
    const snapshotFilePath = await this.createSnapshot();
    setTimeout(async () => {
      if (oldSnapshotFilePath !== null) {
        await fs.unlink(oldSnapshotFilePath);
      }
      setTimeout(() => this.loopSnapshots(snapshotFilePath), 1000 * this.deletionCreationInterval);
    }, 1000 * this.creationDeletionInterval);
  }

  async createSnapshot() {
    const gridImage = new this.Jimp(this.gridSize, this.gridSize);
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const tileColor = this.gridState.getTileColor(i, j);
        const [r, g, b] = this.colorToComponents((tileColor !== null) ? tileColor : this.blankTileColor);
        gridImage.setPixelColor(this.Jimp.rgbaToInt(r, g, b, 255), i, j);
      }
    }
    gridImage.scaleToFit(this.snapshotWidth, this.snapshotHeight);

    const snapshot = new this.Jimp(this.snapshotWidth, this.snapshotHeight, 0x00000000);
    const dx = Math.round((this.snapshotWidth  - gridImage.bitmap.width)  / 2);
    const dy = Math.round((this.snapshotHeight - gridImage.bitmap.height) / 2);
    snapshot.blit(gridImage, dx, dy);

    this.lastSnapshotFileName = `${this.currentTimestamp()}.png`;
    const snapshotFilePath = path.join(
      this.webdir, this.snapshotsDirSubpath, this.lastSnapshotFileName
    );
    await snapshot.writeAsync(snapshotFilePath);
    return snapshotFilePath;
  }



  async updateTile(tile, status, ordinal=null) {
    await this.updateTiles([tile], status, ordinal);
  }

  async updateTiles(tileArray, status, ordinal=null) {
    const locatedStateArray = tileArray.map((tile) => this.gridState.updateTile(tile, status, ordinal));
    if (this.app.BROWSER) {
      this.graffitiUI.updateTilesRendering(locatedStateArray);
    } else if (status === "confirmed") {
      await this.updateTilesInDatabase(locatedStateArray, ordinal);
    }
  }

  async updateTilesInDatabase(locatedStateArray, ordinal) {
    const maxSqlValueNumber = 999, nbSqlColumns = 6;
    const nbTilesPerStatement = Math.ceil(maxSqlValueNumber / nbSqlColumns) - 1;
    const nbTiles = locatedStateArray.length;
    const nbStatements = Math.ceil(nbTiles / nbTilesPerStatement);
    let kMin, kMax, sqlValues, params, i, j, state, components;
    for (let n = 0; n < nbStatements; n++) {
      kMin = n * nbTilesPerStatement;
      kMax = Math.min(nbTiles, (n+1) * nbTilesPerStatement);
      sqlValues = [], params = {};
      for (let k = kMin; k < kMax; k++) {
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
      const sql = "REPLACE INTO tiles (i, j, red, green, blue, ordinal) VALUES\n" + sqlValues.join(",\n");
      await this.app.storage.runDatabase(sql, params, "graffiti");
    }
  }



  colorToComponents(color) {
    const hexComponents = [0, 1, 2].map(k => color.substring(2*k+1, 2*k+3));
    return hexComponents.map(hex => parseInt(hex, 16));
  }

  componentsToColor(components) {
    const hexComponents = components.map(c => ((c < 16) ? "0" : "") + c.toString(16));
    return "#" + hexComponents.join("");
  }

  currentTimestamp() {
    return (new Date()).getTime();
  }
}

module.exports = Graffiti;