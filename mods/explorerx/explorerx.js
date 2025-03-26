const ModTemplate = require('../../lib/templates/modtemplate');
const sanitizer = require('sanitizer');

class ExplorerX extends ModTemplate {
  constructor(app) {
    super(app);
    this.app = app;
    this.name = 'ExplorerX';
    this.slug = 'explorerx';
    this.description = 'Modern block explorer using React components';
    this.categories = 'Utilities Dev';
  }


  webServer(app, expressapp) {
    const explorer_self = this;

    // Serve static files
    expressapp.get('/explorerx/components.js', (req, res) => {
      res.sendFile(__dirname + '/web/components.js');
    });

    expressapp.get('/explorerx/css/explorer-base.css', function (req, res) {
			if (!res.finished) {
				return res.sendFile(__dirname + '/web/css/explorer-base.css');
			}
			return;
		});

    expressapp.get('/explorerx/style.css', (req, res) => {
      res.sendFile(__dirname + '/web/style.css');
    });

    // API endpoint for blocks
    expressapp.get('/explorerx/blocks/:page', async (req, res) => {
      try {
        const page = parseInt(req.params.page) || 0;
        const latest_block_id = await this.app.blockchain.getLatestBlockId();
        const blocks = [];
        
        const BLOCKS_PER_PAGE = 20;
        const startBlock = latest_block_id - (BigInt(page) * BigInt(BLOCKS_PER_PAGE));
        let endBlock = startBlock - BigInt(BLOCKS_PER_PAGE);
        
        if (endBlock < BigInt(0)) {
          endBlock = BigInt(0);
        }

        for (let id = startBlock; id >= endBlock; id--) {
          const hash = await this.app.blockchain.getLongestChainHashAtId(id);
          if (hash) {
            const block = await this.app.blockchain.getBlock(hash);
            if (block) {
              const blockData = JSON.parse(block.toJson());
              blockData.isLongestChain = true;
              blocks.push(blockData);
            }
          }
        }

        res.json({
          blocks,
          totalBlocks: latest_block_id.toString(),
          currentPage: page
        });
      } catch (err) {
        console.error('Error fetching blocks:', err);
        res.status(500).json({ error: 'Error fetching blocks' });
      }
    });

    expressapp.get('/explorerx/', async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      if (!res.finished) {
        res.set('Content-type', 'text/html');
        res.charset = 'UTF-8';
        return res.send(await explorer_self.returnIndexHTML(page));
      }
    });

    expressapp.get('/explorerx/block', async (req, res) => {
      const hash = sanitizer.sanitize(req.query.hash);
      if (!res.finished) {
        res.setHeader('Content-type', 'text/html');
        res.charset = 'UTF-8';
        return res.send(await explorer_self.returnBlockHTML(hash));
      }
    });

    expressapp.get('/explorerx/json-block/:hash', async (req, res) => {
      try {
        const block = await app.blockchain.getBlock(req.params.hash);
        const txs = block.transactions.map(tx => {
          const txJson = tx.toJson();
          txJson.msg = tx.returnMessage();
          return txJson;
        });
        const blockData = JSON.parse(block.toJson());
        blockData.transactions = txs;
        res.json(blockData);
      } catch (err) {
        res.status(404).json({ error: 'Block not found' });
      }
    });

    expressapp.get('/explorerx/stats', async (req, res) => {
      try {
        // Get wallet public key
        const publicKey = await explorer_self.app.wallet.getPublicKey();
        
        // Get wallet balance
        const balance = await explorer_self.app.wallet.getBalance();
        
        // Get mempool transactions
        //const mempoolTxs = await explorer_self.app.mempool.returnNormalTransactions();
        //let txs = await S.getInstance().getMempoolTxs();
        const mempoolTxs = 0;
        // Get latest block ID
        const latestBlockId = await explorer_self.app.blockchain.getLatestBlockId();

        // Return JSON response
        res.json({
          address: publicKey,
          balance: balance.toString(), // Convert BigInt to string
          mempoolCount: mempoolTxs.length,
          latestBlock: latestBlockId.toString() // Convert BigInt to string
        });
      } catch (err) {
        console.error("Error in /explorerx/stats:", err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: err.message
        });
      }
    });
  }

  returnHead() {
    return `
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Saito ExplorerX</title>
          <link rel="stylesheet" href="/saito/css-imports/saito-variables.css">
          <link rel="stylesheet" href="/explorerx/style.css">
          <!-- Add Inter font for modern UI feel -->
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone@7.22.17/babel.min.js"></script>
          <!-- Add heroicons for modern UI icons -->
          <script src="https://unpkg.com/@heroicons/react@2.0.18/24/outline/esm/index.js"></script>
          <script src="/explorerx/components.js" type="text/babel" data-presets="react"></script>
          <script src="/saito/lib/jsonTree/jsonTree.js"></script>
          <link rel="stylesheet" type="text/css" href="/saito/lib/jsonTree/jsonTree.css" />
        </head>
    `;
  }

  async returnIndexHTML(page) {
    return `
      ${this.returnHead()}
      <body>
        <div id="explorer-root"></div>
        <script type="text/babel">
          console.log("Starting React render...");
          try {
            const root = ReactDOM.createRoot(document.getElementById('explorer-root'));
            root.render(
              React.createElement(ExplorerApp, { initialPage: ${page} })
            );
            console.log("React render complete");
          } catch (error) {
            console.error("Error rendering React app:", error);
          }
        </script>
      </body>
      </html>
    `;
  }

  async returnBlockHTML(hash) {
    return `
      ${this.returnHead()}
      <body>
        <div id="block-root"></div>
        <script type="text/babel">
          const root = ReactDOM.createRoot(document.getElementById('block-root'));
          root.render(<BlockView hash="${hash}" />);
        </script>
      </body>
      </html>
    `;
  }

  render(app, data) {
    let explorer_self = this;
    let explorerMain = document.querySelector('.explorer-main');
    if (explorerMain) {
      explorerMain.__module = explorer_self;
    }
    // ... rest of render method
  }
}

const formatSaito = (nolan) => {
  const amount = BigInt(nolan);
  const saito = Number(amount) / 100000000;
  return saito.toLocaleString(undefined, { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 8 
  });
};

module.exports = ExplorerX; 