const createHash = require("crypto").createHash;
const path = require("path");

const PeerService = require("saito-js/lib/peer_service").default;
const Transaction = require("../../lib/saito/transaction").default;
const ModTemplate = require("../../lib/templates/modtemplate");

const BoardState = require("./lib/board-state").default;
const ColorConverter = require("./lib/color-converter").default;
const index = require("./index");


class Graffiti extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Graffiti";
    this.slug = "graffiti";
    
    this.boardWidth  = 800;
    this.boardHeight = 600;
    this.blankTileRgbaColor = {red: 255, green: 255, blue: 255, alpha: 255};
    this.txOrderPrecision = 6;

    this.ordinal_bitsize = 1 + this.bitsize(this.currentTimestamp() * (10 ** this.txOrderPrecision));
  }

  async initialize(app) {
    await super.initialize(app);

    this.boardState = new BoardState(this);
    if (!this.app.BROWSER) {
      await this.loadTilesFromDatabase();
    }

    this.tilesProcessQueue = [];
    this.isTilesProcessOngoing = false;

    this.serveBoard = !this.app.BROWSER;
  }

  async loadTilesFromDatabase() {
    const rows = await this.app.storage.queryDatabase(this.queryForAllTiles(), {}, "graffiti");
    for (const row of rows) {
      const rowRgbaColor = {red: row.red, green: row.green, blue: row.blue, alpha: row.alpha ?? 255};
      this.boardState.setTile({i: row.i, j: row.j, rgbaColor: rowRgbaColor, ordinal: row.ordinal}, "confirmed");
    }
  }

  returnServices() {
    if (this.serveBoard) {
      return [new PeerService(null, "graffiti: board")];
    } else {
      return [];
    }
  }

  async onPeerServiceUp(app, peer, service={}) {
    if (this.app.BROWSER && !this.browser_active) {
      return;
    }
    if (service.service === "graffiti: board" || service.service === "graffiti") {
      const board = await this.fetchBoardFromPeer(peer);
      if (this.app.BROWSER) {
        window.userInterface.finishRendering(this);
      }
      await this.setBoard(board);
    }
  }

  async fetchBoardFromPeer(peer) {
    try {
      console.log("[Graffiti] Fetching board from peer board state...");
      return await this.fetchBoardFromPeer_boardState(peer);
    } catch (err) {
      console.info("[Graffiti] Failed: Fetching board from peer board state.", err);
      console.log("[Graffiti] Fetching board from peer database...");
      return await this.fetchBoardFromPeer_database(peer); // legacy
    }
  }

  fetchBoardFromPeer_boardState(peer) {
    return new Promise((resolve, reject) => {
      this.app.network.sendRequestAsTransaction(
        "graffiti: serve board",
        [this.boardWidth, this.boardHeight],
        async (response) => {
          try {
            if (typeof(response) !== "string") {
              reject("Invalid response.");
            }
            const board = await this.board_fromBuffer(Buffer.from(response, "latin1"), this.boardWidth, this.boardHeight);
            if (!this.isValidBoard(board)) {
              reject("Invalid board.");
            }
            resolve(board);
          } catch (err) {
            reject(err);
          }
        },
        peer.peerIndex
      );
    });
  }

  fetchBoardFromPeer_database(peer) {
    return new Promise((resolve, reject) => {
      this.sendPeerDatabaseRequestWithFilter(
        this.name, this.queryForAllTiles(),
        async (response) => {
          if (response.rows) {
            const board = this.newGrid((i, j) => null);
            for (const data of response.rows) {
              if (this.isValidRow(data)) {
                const row = data;
                board[row.i][row.j] = {
                  rgbaColor: {red: row.red, green: row.green, blue: row.blue, alpha: row.alpha ?? 255},
                  ordinal: row.ordinal
                };
              } else {
                reject(`Invalid row: ${data}`);
              }
            }
            resolve(board);
          } else {
            reject(`No rows in response: ${response}.`);
          }
        },
        (p) => p.peerIndex === peer.peerIndex
      );
    });
  }

  queryForAllTiles() {
    return `SELECT * FROM tiles WHERE i < ${this.boardWidth} AND j < ${this.boardHeight}`;
  }



  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();
    try {
      if (conf == 0) {
        if (txmsg.module === this.name && (txmsg.request === "draw tiles" || txmsg.request === "paint")) {
          await this.receiveDrawingTransaction(tx);
        }
      }
    } catch (err) {
      console.error("In " + this.name + ".onConfirmation: " + err);
    }
  }

  async handlePeerTransaction(app, newtx=null, peer, mycallback=null) {
    if (newtx === null) { return 0; }
    const message = newtx.returnMessage();

    if (message?.request === "graffiti: update tiles") {
      if (message?.data) {
        if (this.app.BROWSER && this.browser_active) {
          const tx = new Transaction(undefined, message.data);
          const txmsg = tx.returnMessage();
          if (txmsg.module === this.name && (txmsg.request === "draw tiles" || txmsg.request === "paint")) {
            this.publicKey = await this.app.wallet.getPublicKey();
            if (!tx.isFrom(this.publicKey)) {
              await this.receiveDrawingTransaction(tx);
            }
          }
        }
      }
      return 1;
    }
    if (message?.request === "graffiti: serve board") {
      if (this.serveBoard) {
        if (this.isValidSize(message?.data)) {
          const confirmedBoard = this.boardState.getConfirmedBoard(message.data[0], message.data[1]);
          const confirmedBoardBuffer = await this.buffer_fromBoard(confirmedBoard);
          mycallback(confirmedBoardBuffer.toString("latin1"));
        }
      }
      return 1;
    }

    return super.handlePeerTransaction(app, newtx, peer, mycallback);
  }

  async notifyPeers(tx) {
    const peers = await this.app.network.getPeers();
    for (const peer of peers) {
      if (peer.synctype === "lite") {
        this.app.network.sendRequestAsTransaction("graffiti: update tiles", tx.toJson(), null, peer.peerIndex);
      }
    }
  }

  async sendDrawingTransaction(tileArray) {
    const tileArrayData = this.tileArrayData_fromTileArray(tileArray);

    const newtx = await this.app.wallet.createUnsignedTransaction();
    newtx.msg = {module: this.name, request: "paint", data: tileArrayData};

    await newtx.sign();
    await this.app.network.propagateTransaction(newtx);

    return this.transactionOrdinal(newtx);
  }

  async receiveDrawingTransaction(tx) {
    const ordinal = this.transactionOrdinal(tx);
    if (!this.isValidOrdinal(ordinal)) { return; }

    const txData = tx.returnMessage().data;
    const tileArray = this.isValidTileArrayData(txData)   ? this.tileArray_fromTileArrayData(txData)   :
                      this.isValidLegacyTileArray(txData) ? this.tileArray_fromLegacyTileArray(txData) : undefined;
    if (!this.isValidTileArray(tileArray)) { return; }


    const effectiveTileArray = this.boardState.setTiles(tileArray, ordinal);

    if (!this.app.BROWSER) {
      await this.notifyPeers(tx);
    }

    this.tilesProcessQueue.push(effectiveTileArray);
    if (!this.isTilesProcessOngoing) {
      this.processTileQueue();
    }
  }

  // Orders transactions in case they have tiles in common and timestamps are equal.
  transactionOrdinal(tx) {
    const sigHash = parseInt(createHash("md5").update(tx.signature).digest("hex"), 16) % (10 ** this.txOrderPrecision);
    return tx.timestamp * (10 ** this.txOrderPrecision) + sigHash;
  }

  async processTileQueue() {
    this.isTilesProcessOngoing = true;
    while (this.tilesProcessQueue.length > 0) {
      if (!this.app.BROWSER) {
        console.log(`[Graffiti] /!\\ ${this.tilesProcessQueue.length} tile batches left to be processed.`);
      }
      const effectiveTileArray = this.tilesProcessQueue.shift();
      await this.setEffectiveTiles(effectiveTileArray);
    }
    this.isTilesProcessOngoing = false;
  }



  async setBoard(board) {
    const tileArray = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] !== null) {
          tileArray.push({i: i, j: j, rgbaColor: board[i][j].rgbaColor, ordinal: board[i][j].ordinal});
        }
      }
    }
    await this.setTiles(tileArray);
  }

  async setTiles(tileArray, ordinal=undefined) {
    const effectiveTileArray = this.boardState.setTiles(tileArray, ordinal);
    await this.setEffectiveTiles(effectiveTileArray);
  }

  async setEffectiveTiles(effectiveTileArray) {
    if (this.app.BROWSER) {
      window.userInterface.drawConfirmedTiles(effectiveTileArray);
      window.userInterface.undrawPendingTiles(effectiveTileArray.filter((effectiveTile) => !effectiveTile.pendingExists));
    } else {
      await this.setTilesInDatabase(effectiveTileArray);
    }
  }

  async setTilesInDatabase(tileArray) {
    const maxNbValuesPerStatement = 32766, nbSqlColumns = 7;
    const nbTilesPerStatement = Math.ceil(maxNbValuesPerStatement / nbSqlColumns) - 1;
    const nbTiles = tileArray.length;
    const nbStatements = Math.ceil(nbTiles / nbTilesPerStatement);
    let kMin, kMax, sqlValues, params;
    for (let n = 0; n < nbStatements; n++) {
      kMin = n * nbTilesPerStatement;
      kMax = Math.min(nbTiles, (n+1) * nbTilesPerStatement);
      sqlValues = []; params = {};
      for (let k = kMin; k < kMax; k++) {
        sqlValues.push(`($i${k}, $j${k}, $red${k}, $green${k}, $blue${k}, $alpha${k}, $ordinal${k})`);
        params[`$i${k}`] = tileArray[k].i;
        params[`$j${k}`] = tileArray[k].j;
        params[`$red${k}`]   = Math.round(tileArray[k].rgbaColor.red);
        params[`$green${k}`] = Math.round(tileArray[k].rgbaColor.green);
        params[`$blue${k}`]  = Math.round(tileArray[k].rgbaColor.blue);
        params[`$alpha${k}`] = Math.round(tileArray[k].rgbaColor.alpha);
        params[`$ordinal${k}`] = tileArray[k].ordinal;
      }
      const sqlStatement = "REPLACE INTO tiles (i, j, red, green, blue, alpha, ordinal) VALUES\n" + sqlValues.join(",\n");
      console.log(`[Graffiti] Updating database... (${n+1}/${nbStatements})`);
      await this.app.storage.runDatabase(sqlStatement, params, "graffiti");
    }
    console.log(`[Graffiti] Database updated.`);
  }



  async buffer_fromBoard(board) {
    const [width, height] = [board.length, board[0].length];



    const ordinals = [];
    const ordinalsPositions = new Map();
    for (let i = 0; i < Math.min(width, this.boardWidth); i++) {
      for (let j = 0; j < Math.min(height, this.boardHeight); j++) {
        const tileOrdinal = board[i][j]?.ordinal ?? null;
        if (tileOrdinal !== null) {
          if (!ordinalsPositions.has(tileOrdinal)) {
            ordinals.push(tileOrdinal);
            ordinalsPositions.set(tileOrdinal, [{i, j}]);
          } else {
            ordinalsPositions.get(tileOrdinal).push({i, j});
          }
        }
      }
    }

    const nbPositionsInTotal = width * height;
    const nbPositionsInTotal_bitsize = this.bitsize(nbPositionsInTotal);
    const nbOrdinals_bitsize = nbPositionsInTotal_bitsize;
    const nbOrdinalPositions_bitsize = nbPositionsInTotal_bitsize;
    const position_bitsize = nbPositionsInTotal_bitsize;
    
    const integerCode = (n, nbBits) => n.toString(2).padStart(nbBits, "0");

    const ordinalsCode =
      integerCode(ordinals.length, nbOrdinals_bitsize) + 
      ordinals.map((ordinal) => {
        const positions = ordinalsPositions.get(ordinal);

        const ordinalCode = integerCode(ordinal, this.ordinal_bitsize);
        const nbOrdinalPositionsCode = integerCode(positions.length, nbOrdinalPositions_bitsize);
        const ordinalPositionsCode = positions.map((position) => {
          const index = position.j * width + position.i;
          return integerCode(index, position_bitsize);
        }).join("");

        return ordinalCode + nbOrdinalPositionsCode + ordinalPositionsCode;
      }).join("");
    
    const ordinalsBuffer = Buffer.from(this.byteArray_fromBitString(ordinalsCode));



    this.Jimp = require("jimp");
    const boardImage = new this.Jimp(width, height);
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const tileRgbaColor = board[i][j]?.rgbaColor ?? null;
        const {red, green, blue, alpha} = (tileRgbaColor !== null) ? tileRgbaColor : {red: 0, green: 0, blue: 0, alpha: 0};
        boardImage.setPixelColor(this.Jimp.rgbaToInt(red, green, blue, alpha), i, j);
      }
    }
    const boardImageBuffer = await boardImage.getBufferAsync(this.Jimp.MIME_PNG);



    return Buffer.concat([ordinalsBuffer, boardImageBuffer]);
  }

  async board_fromBuffer(buffer, width, height) {
    try {
      const board = this.newGrid((i, j) => null, width, height);


      
      const bitString = this.bitString_fromBuffer(buffer);

      const nbPositionsInTotal = width * height;
      const nbPositionsInTotal_bitsize = this.bitsize(nbPositionsInTotal);
  
      const nbOrdinals_bitsize         = nbPositionsInTotal_bitsize;
      const nbOrdinalPositions_bitsize = nbPositionsInTotal_bitsize;
      const position_bitsize           = nbPositionsInTotal_bitsize;
  
  
      let [head, tail] = [0, 0];
      
      const read = (nbBits) => {
        [head, tail] = [tail, tail + nbBits];
        if (tail > bitString.length) {
          throw new Error(`tail (${tail}) > bitString.length (${bitString.length}) (head: ${head}, nbBits: ${nbBits})`);
        }
        return parseInt(bitString.slice(head, tail), 2);
      };

      const nbOrdinals = read(nbOrdinals_bitsize);
      for (let o = 0; o < nbOrdinals; o++) {
        const ordinal = read(this.ordinal_bitsize);
        const nbOrdinalPositions = read(nbOrdinalPositions_bitsize);
  
        for (let p = 0; p < nbOrdinalPositions; p++) {
          const positionIndex = read(position_bitsize);
          board[positionIndex % width][Math.floor(positionIndex / width)] = {ordinal};
        }
      }


      const ordinalsCode_bitsize = tail;
      const ordinalsBuffer_bytesize = Math.ceil(ordinalsCode_bitsize / 8);



      if (this.app.BROWSER) {
        const colorsBuffer = buffer.buffer.slice(ordinalsBuffer_bytesize);
        const boardImage = await new Promise((resolve, reject) => {
          const image = new Image();
          image.src = URL.createObjectURL(new Blob([colorsBuffer], {type: "image/png"}));
          image.onload = () => { resolve(image); };
        });
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(boardImage, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        for (let i = 0; i < width; i++) {
          for (let j = 0; j < height; j++) {
            if (board[i][j] !== null) {
              const index = 4 * (j * width + i);
              board[i][j].rgbaColor = {
                red:   imageData.data[index + 0],
                green: imageData.data[index + 1],
                blue:  imageData.data[index + 2],
                alpha: imageData.data[index + 3]
              };
            }
          }
        }
      } else {
        const colorsBuffer = buffer.slice(ordinalsBuffer_bytesize);

        this.Jimp = require("jimp");
        const boardImage = await this.Jimp.read(colorsBuffer);
        for (let i = 0; i < width; i++) {
          for (let j = 0; j < height; j++) {
            if (board[i][j] !== null) {
              const {r: red, g: green, b: blue, a: alpha} = this.Jimp.intToRGBA(boardImage.getPixelColor(i, j));
              board[i][j].rgbaColor = {red, green, blue, alpha};
            }
          }
        }
      }
      return board;
    } catch (err) {
      console.info("Invalid board buffer. Returning null.", err);
      return null;
    }
  }



  isValidBoard(data) {
    return Array.isArray(data) && this.isValidWidth(data.length) && data.every((arrayElement) =>
      Array.isArray(arrayElement) && this.isValidHeight(arrayElement.length) && arrayElement.every((arrayArrayElement) =>
           arrayArrayElement === null
        || (this.isValidRgbaColor(arrayArrayElement?.rgbaColor) && this.isValidOrdinal(arrayArrayElement?.ordinal))
      )
    );
  }

  isValidTileArray(data) {
    return Array.isArray(data) && data.every((arrayElement) =>
      this.areValidCoordinates(arrayElement?.i, arrayElement?.j) && this.isValidRgbaColor(arrayElement?.rgbaColor)
    );
  }

  isValidLegacyTileArray(data) {
    return Array.isArray(data) && data.every((arrayElement) =>
      this.areValidCoordinates(arrayElement?.i, arrayElement?.j) && this.isValidHexColor(arrayElement?.color)
    );
  }

  isValidTileArrayData(data) {
    return Array.isArray(data) && data.every((arrayElement) =>
         Array.isArray(arrayElement)
      && ((arrayElement.length === 6 && this.isValidRgbaComponent(arrayElement[5])) || arrayElement.length === 5)
      && this.areValidRgbaComponents(arrayElement[2], arrayElement[3], arrayElement[4])
      && this.areValidCoordinates(arrayElement[0], arrayElement[1])
    );
  }

  isValidRow(data) {
    return this.areValidCoordinates(data?.i, data?.j)
        && this.areValidRgbaComponents(data?.red, data?.green, data?.blue)
        && this.isValidOrdinal(data?.ordinal);
  }

  areValidCoordinates(data1, data2) {
    return [[data1, "i"], [data2, "j"]].every((args) => this.isValidCoordinate(...args));
  }

  isValidCoordinate(data, coordinateName) {
    return this.isValidIntegerBetweenBounds(data, 0, {i: this.boardWidth, j: this.boardHeight}[coordinateName] - 1);
  }

  isValidIntegerBetweenBounds(data, minValue, maxValue) {
    return this.isValidInteger(data) && data >= minValue && data <= maxValue;
  }

  isValidInteger(data) {
    return typeof(data) === "number" && Number.isInteger(data);
  }

  isValidWidth(data) {
    return this.isValidIntegerBetweenBounds(data, 1, this.boardWidth);
  }

  isValidHeight(data) {
    return this.isValidIntegerBetweenBounds(data, 1, this.boardHeight);
  }

  isValidSize(data) {
    return Array.isArray(data) && data.length === 2 && this.isValidWidth(data[0]) && this.isValidHeight(data[1]);
  }

  areValidRgbaComponents(...dataArray) {
    return dataArray.every((data) => this.isValidRgbaComponent(data));
  } 

  isValidRgbaComponent(data) {
    return this.isValidIntegerBetweenBounds(data, 0, 255);
  }

  isValidRgbaColor(data) {
    return this.areValidRgbaComponents(data?.red, data?.green, data?.blue, data?.alpha);
  }

  isValidHexColor(data) {
    return typeof(data) === "string" && /^#[0-9a-f]{6}$/i.test(data);
  }

  isValidOrdinal(data) {
    return typeof(data) === "number" && data < (this.currentTimestamp() + 1) * (10 ** this.txOrderPrecision);
  }



  webServer(app, expressapp, express) {
    this.webdir = path.normalize(`${__dirname}/../../mods/${this.dirname}/web`);

    expressapp.use("/" + encodeURI(this.slug), express.static(this.webdir));

    expressapp.get("/" + encodeURI(this.slug), (req, res) => {
      res.setHeader("Content-type", "text/html");
      res.charset = "UTF-8";
      res.send(index(app));
    });
  }



  tileArray_fromLegacyTileArray(legacyTileArray) {
    return legacyTileArray.map((legacyTile) => ({
      i: legacyTile.i, j: legacyTile.j,
      rgbaColor: ColorConverter.rgba_fromHex(legacyTile.color)
    }));
  }

  tileArray_fromTileArrayData(tileArrayData) {
    return tileArrayData.map((tileData) => ({
      i: tileData[0], j: tileData[1],
      rgbaColor: {red: tileData[2], green: tileData[3], blue: tileData[4], alpha: tileData[5] ?? 255}
    }));
  }

  tileArrayData_fromTileArray(tileArray) {
    return tileArray.map((tile) => {
      const tileData = [tile.i, tile.j, tile.rgbaColor.red, tile.rgbaColor.green, tile.rgbaColor.blue];
      if (tile.rgbaColor.alpha !== 255) {
        tileData.push(tile.rgbaColor.alpha);
      }
      return tileData;
    });
  }



  mixedRgbaColor(rgbaColor1, rgbaColor2) {
    const [R1, G1, B1, a1] = [rgbaColor1.red, rgbaColor1.green, rgbaColor1.blue, rgbaColor1.alpha / 255];
    const [R2, G2, B2, a2] = [rgbaColor2.red, rgbaColor2.green, rgbaColor2.blue, rgbaColor2.alpha / 255];

    const a12 = 1 - (1 - a1) * (1 - a2);
    return {
      red:   (a12 !== 0) ? ((1 - a2) * a1*R1 + a2 * R2) / a12 : 0,
      green: (a12 !== 0) ? ((1 - a2) * a1*G1 + a2 * G2) / a12 : 0,
      blue:  (a12 !== 0) ? ((1 - a2) * a1*B1 + a2 * B2) / a12 : 0,
      alpha: a12 * 255
    };
  }

  roundedMixedRgbaColor(rgbaColor1, rgbaColor2) {
    const mix = this.mixedRgbaColor(rgbaColor1, rgbaColor2);
    for (const componentName of Object.keys(mix)) {
      mix[componentName] = Math.round(mix[componentName]);
    }
    return mix;
  }



  newGrid(map, width=undefined, height=undefined) {
    if (width  === undefined) { width  = this.boardWidth;  }
    if (height === undefined) { height = this.boardHeight; }

    const grid = new Array(width);
    for (let i = 0; i < width; i++) {
      grid[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        grid[i][j] = map(i, j);
      }
    }
    return grid;
  }



  currentTimestamp() {
    return (new Date()).getTime();
  }



  bitString_fromBuffer(buffer) {
    return Array.from(buffer).map((byte) => this.bitString_fromByte(byte)).join("");
  }

  bitString_fromByte(byte) {
    return byte.toString(2).padStart(8, "0");
  }

  byteArray_fromBitString(bitString) {
    const chunks = bitString.match(/.{1,8}/g);
    chunks[chunks.length - 1] = chunks[chunks.length - 1].padEnd(8, "0");
    return chunks.map((chunk) => parseInt(chunk, 2));
  }

  bitsize(n) {
    return Math.floor(Math.log2(n)) + 1;
  }
}

module.exports = Graffiti;