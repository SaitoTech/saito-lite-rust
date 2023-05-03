const ModTemplate = require("../../lib/templates/modtemplate");
const sanitizer = require("sanitizer");
const JSON = require("json-bigint");

class ExplorerCore extends ModTemplate {
  constructor(app) {
    super(app);
    this.app = app;
    this.name = "Explorer";
    this.description = "Block explorer for the Saito blockchain. Not suitable for lite-clients";
    this.categories = "Utilities Dev";
  }


  webServer(app, expressapp) {

    var explorer_self = app.modules.returnModule("Explorer");

    ///////////////////
    // web resources //
    ///////////////////
    expressapp.get("/explorer/", function (req, res) {
      res.set("Content-type", "text/html");
      res.charset = "UTF-8";
      res.send(explorer_self.returnIndexHTML(app));
      return;
    });

    expressapp.get("/explorer/style.css", function (req, res) {
      res.sendFile(__dirname + "/web/style.css");
      return;
    });

    expressapp.get("/explorer/css/explorer-base.css", function (req, res) {
      res.sendFile(__dirname + "/web/css/explorer-base.css");
      return;
    });

    expressapp.get("/explorer/utils.js", function (req, res) {
      res.sendFile(__dirname + "/web/utils.js");
      return;
    });

    ///////////////////
    // web requests //
    ///////////////////
    expressapp.get("/explorer/block", function (req, res) {

      var hash = sanitizer.sanitize(req.query.hash);

      if (hash == null) {

        res.setHeader("Content-type", "text/html");
        res.charset = "UTF-8";
        res.send("Please provide a block hash.");
        return;

      } else {

        res.setHeader("Content-type", "text/html");
        res.charset = "UTF-8";
        res.send(explorer_self.returnBlockHTML(app, hash));
        return;

      }
    });

    expressapp.get("/explorer/mempool", function (req, res) {

      res.setHeader("Content-type", "text/html");
      res.charset = "UTF-8";
      res.send(explorer_self.returnMempoolHTML());
      return;

    });

    expressapp.get("/explorer/blocksource", function (req, res) {

      var hash = sanitizer.sanitize(req.query.hash);

      if (hash == null) {
        res.setHeader("Content-type", "text/html");
        res.charset = "UTF-8";
        res.send("NO BLOCK FOUND 1: ");
        return;

      } else {

        if (hash != null) {

          //let blk = explorer_self.app.storage.loadBlockByHash(hash);

          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.send(explorer_self.returnBlockSourceHTML(app, hash));
          return;
        }
      }
    });

  }

  returnHead() {
    return "<html> \
  <head> \
    <meta charset=\"utf-8\"> \
    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"> \
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> \
    <meta name=\"description\" content=\"\"> \
    <meta name=\"author\" content=\"\"> \
    <title>Saito Network: Blockchain Explorer</title> \
    <link rel=\"stylesheet\" type=\"text/css\" href=\"/saito/saito.css\" /> \
    <link rel=\"stylesheet\" type=\"text/css\" href=\"/explorer/style.css\" /> \
    <link rel=\"stylesheet\" type=\"text/css\" href=\"/saito/lib/jsonTree/jsonTree.css\" /> \
    <link rel=\"stylesheet\" href=\"/saito/lib/font-awesome-5/css/all.css\" type=\"text/css\" media=\"screen\"> \
    <script src=\"/explorer/utils.js\"></script> \
    <script src=\"/saito/lib/jsonTree/jsonTree.js\"></script> \
    <link rel=\"icon\" sizes=\"192x192\" href=\"/saito/img/touch/pwa-192x192.png\"> \
    <link rel=\"apple-touch-icon\" sizes=\"192x192\" href=\"/saito/img/touch/pwa-192x192.png\"> \
    <link rel=\"icon\" sizes=\"512x512\" href=\"/saito/img/touch/pwa-512x512.png\"> \
    <link rel=\"apple-touch-icon\" sizes=\"512x512\" href=\"/saito/img/touch/pwa-512x512.png\"></link> \
  </head> ";
  }

  returnHeader() {
    return "<body> \
        \
        <div id=\"saito-header\" class=\"header header-home\"> \
        <img class=\"saito-header-logo\" src=\"/saito/img/logo.svg\"> \
    </div>";
  }

  returnIndexMain() {
    return '<div class="explorer-main"> \
        <div class="block-table"> \
          <div class="explorer-data"><h4>Server Address:</h4></div> <div class="address">'+ this.app.wallet.returnPublicKey() + '</div> \
          <div class="explorer-data"><h4>Balance:</h4> </div><div>'+ this.app.wallet.returnBalance() + '</div> \
          <div class="explorer-data"><h4>Mempool:</h4></div> <div><a href="/explorer/mempool">'+ this.app.mempool.mempool.transactions.length + ' txs</a></div> \
        </div>' + '\
        <div class="explorer-data"><h4>Search for Block (by hash):</h4> \
        <form method="get" action="/explorer/block"><div class="one-line-form"><input type="text" name="hash" class="hash-search-input" /> \
        <input type="submit" id="explorer-button" class="button" value="search" /></div></form> </div> \
        <div class="explorer-data"><h3>Recent Blocks:</h3></div> \
        <div id="block-list">'+ this.listBlocks() + '</div> \
      </div> ';
  }

  returnPageClose() {
    return "</body> \
        </html>";
  }

  /////////////////////
  // Main Index Page //
  /////////////////////
  returnIndexHTML(app) {
    var html = this.returnHead() + this.returnHeader() + this.returnIndexMain() + this.returnPageClose();
    return html;
  }

  returnMempoolHTML() {
    var html = this.returnHead();
    html += this.returnHeader();
    html += "<div class=\"explorer-main\">";
    html += "<a class=\"button\" href=\"/explorer/\"><i class=\"fas fa-cubes\"></i> back to blocks</a>";
    html += "<h3>Mempool Transactions:</h3><div data-json=\"" + encodeURI(JSON.stringify(this.app.mempool.mempool.transactions, null, 4)) + "\" class=\"json\">" + JSON.stringify(this.app.mempool.mempool.transactions) + "</div></div>";
    html += this.returnInvokeJSONTree();
    html += this.returnPageClose();
    return html;
  }

  returnBlockSourceHTML(app, hash) {
    var html = this.returnHead();
    html += this.returnHeader();
    html += "<div class=\"explorer-main\">";
    html += "<a class=\"button\" href=\"/explorer/block?hash=" + hash + "\"><i class=\"fas fa-cubes\"></i> back to block</a>";
    html += "<h3>Block Source (" + hash + "):</h3><div class=\"blockJson\"><div class=\"loader\"></div></div>";
    html += "<script> \
        fetchRawBlock(\"" + hash + "\"); \
      </script>";
    html += this.returnPageClose();
    return html;
  }

  returnInvokeJSONTree() {
    var jstxt = "\n <script> \n \
    var jsonObj = document.querySelector(\".json\"); \n \
    var jsonTxt = decodeURI(jsonObj.dataset.json); \n \
    jsonObj.innerHTML = \"\"; \n \
    var tree = jsonTree.create(JSON.parse(jsonTxt), jsonObj); \n \
    </script> \n";
    return jstxt;
  }

  listBlocks() {

    var explorer_self = this;
    let latest_block_id = explorer_self.app.blockring.returnLatestBlockId();

    var html = '<div class="blockchain-table">';
    html += '<div class="table-header"></div><div class="table-header">id</div><div class="table-header">block hash</div><div class="table-header">tx</div><div class="table-header">previous block</div>';

    for (var mb = latest_block_id; mb >= BigInt(0) && mb > latest_block_id - BigInt(200); mb--) {

      let longest_chain_hash = explorer_self.app.blockring.returnLongestChainBlockHashAtBlockId(mb);
      let hashes_at_block_id = explorer_self.app.blockring.returnBlockHashesAtBlockId(mb);

      for (let i = 0; i < hashes_at_block_id.length; i++) {

        let txs_in_block = 0;
        let previous_block_hash = "";

        let block = explorer_self.app.blockchain.blocks.get(hashes_at_block_id[i]);

        if (block) {
          txs_in_block = block.transactions.length;
          previous_block_hash = block.returnPreviousBlockHash();
        }
        if (longest_chain_hash === hashes_at_block_id[i]) {
          html += '<div>*</div>';
        } else {
          html += '<div></div>';
        }
        html += '<div><a href="/explorer/block?hash=' + block.returnHash() + '">' + block.returnId() + '</a></div>';
        html += '<div><a href="/explorer/block?hash=' + block.returnHash() + '">' + block.returnHash() + '</a></div>';
        html += '<div>' + txs_in_block + '</div>';
        html += '<div class="elipsis">' + previous_block_hash + '</div>';
      }
    }
    html += "</div>";
    return html;
  }

  ////////////////////////
  // Single Block Page  //
  ////////////////////////
  returnBlockHTML(app, hash) {
    var html = this.returnHead() + this.returnHeader();

    html += "<div class=\"explorer-main\"> \
      <a href=\"/explorer\"> \
          <button class=\"explorer-nav\"><i class=\"fas fa-cubes\"></i> back to blocks</button> \
        </a> \
      <h3>Block Explorer:</h3> \
      <div class=\"txlist\"><div class=\"loader\"></div></div> \
      </div> \
      <script> \
        fetchBlock(\"" + hash + "\"); \
      </script> \
      ";

    html += this.returnPageClose();
    return html;

  }

  shouldAffixCallbackToModule() {
    return 1;
  }

}

module.exports = ExplorerCore;
