const ModTemplate = require('../../lib/templates/modtemplate');
const sanitizer = require('sanitizer');
const JSON = require('json-bigint');
const S = require('saito-js/saito').default;

class ExplorerCore extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Explorer';
		this.slug = 'explorer';
		this.description = 'Block explorer for the Saito blockchain. Not suitable for lite-clients';
		this.categories = 'Utilities Dev';
		this.class = 'utility';
	}

	webServer(app, expressapp) {
		var explorer_self = app.modules.returnModule('Explorer');

		///////////////////
		// web resources //
		///////////////////
		expressapp.get('/explorer/', async function (req, res) {
			const page = parseInt(req.query.page) || 0;

			if (!res.finished) {
				res.set('Content-type', 'text/html');
				res.charset = 'UTF-8';
				return res.send(await explorer_self.returnIndexHTML(page));
			}
			return;
		});

		expressapp.get('/explorer/style.css', function (req, res) {
			if (!res.finished) {
				return res.sendFile(__dirname + '/web/style.css');
			}
			return;
		});

		expressapp.get('/explorer/css/explorer-base.css', function (req, res) {
			if (!res.finished) {
				return res.sendFile(__dirname + '/web/css/explorer-base.css');
			}
			return;
		});

		expressapp.get('/explorer/utils.js', function (req, res) {
			if (!res.finished) {
				return res.sendFile(__dirname + '/web/utils.js');
			}
			return;
		});

		///////////////////
		// web requests //
		///////////////////
		expressapp.get('/explorer/block', async function (req, res) {
			var hash = sanitizer.sanitize(req.query.hash);

			if (hash == null) {
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send('Please provide a block hash.');
				}
				return;
			} else {
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send(await explorer_self.returnBlockHTML(app, hash));
				}
				return;
			}
		});

		expressapp.get('/explorer/mempool', function (req, res) {
			if (!res.finished) {
				res.setHeader('Content-type', 'text/html');
				res.charset = 'UTF-8';
				return res.send(explorer_self.returnMempoolHTML());
			}
			return;
		});

		expressapp.get('/explorer/blocksource', async function (req, res) {
			var hash = sanitizer.sanitize(req.query.hash);

			if (hash == null) {
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send('NO BLOCK FOUND 1: ');
				}
				return;
			} else {
				if (hash != null) {
					let html = await explorer_self.returnBlockSourceHTML(app, hash)
					if (!res.finished && html) {
						res.setHeader('Content-type', 'text/html');
						res.charset = 'UTF-8';
						return res.send(html);
					}
					return;
				}
			}
		});

		expressapp.get('/explorer/balance', async function (req, res) {
			var pubkey = sanitizer.sanitize(req.query.pubkey);

			if (pubkey == null) {
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send('Please provide a public key.');
				}
				return;
			} else {
				let html = await explorer_self.returnBalanceHTML(app, pubkey);
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send(html);
				}
				return;
			}
		});

		expressapp.get('/explorer/balance/all', async function (req, res) {
				let html = await explorer_self.returnAllBalanceHTML(app);
				if (!res.finished) {
					res.setHeader('Content-type', 'text/html');
					res.charset = 'UTF-8';
					return res.send(html);
				}
				return;
		});

		// //////////////////////
		// full json blocks //
		//////////////////////
		expressapp.get('/explorer/json-block/:bhash', async (req, res) => {
			const bhash = req.params.bhash;
			if (bhash == null) {
				return;
			}

			try {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const blk = await app.blockchain.getBlock(bhash);
				console.log(blk, 'this block');
				if (!blk) {
					return;
				}

				// const blkwtx = new Block(app);
				// blkwtx.block = JSON.parse(JSON.stringify(blk.block));
				// blkwtx.transactions = blk.transactions;
				// blkwtx.app = null;

				var txwmsgs = [];
				blk.transactions.forEach((transaction) => {
					let tx = transaction.toJson();
					tx.msg = transaction.returnMessage();
					txwmsgs.push(tx);
				});

				var fullblock = JSON.parse(blk.toJson());
				fullblock.transactions = txwmsgs;
				let html_to_return = JSON.stringify(fullblock);

				if (!res.finished) {
					res.writeHead(200, {
						'Content-Type': 'text/plain',
						'Content-Transfer-Encoding': 'utf8'
					});
					return res.end(html_to_return);
				}

			} catch (err) {

				console.error('FETCH BLOCKS ERROR SINGLE BLOCK FETCH: ', err);
				if (!res.finished) {
					res.status(400);
					return res.end({
						error: {
							message: `FAILED SERVER REQUEST: could not find block: ${bhash}`
						}
					});
				}
			}
		});
	}

	async initialize(app) {
		console.log("inside initialize of explorer.js");
	}

	returnHead() {
		return '<html> \
  <head> \
    <meta charset="utf-8"> \
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> \
    <meta name="viewport" content="width=device-width, initial-scale=1"> \
    <meta name="description" content=""> \
    <meta name="author" content=""> \
    <title>Saito Network: Blockchain Explorer</title> \
    <link rel="stylesheet" type="text/css" href="/saito/saito.css" /> \
    <link rel="stylesheet" type="text/css" href="/explorer/style.css" /> \
    <link rel="stylesheet" type="text/css" href="/saito/lib/jsonTree/jsonTree.css" /> \
    <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen"> \
    <script src="/explorer/utils.js"></script> \
    <script src="/saito/lib/jsonTree/jsonTree.js"></script> \
    <link rel="icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png"> \
    <link rel="apple-touch-icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png"> \
    <link rel="icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png"> \
    <link rel="apple-touch-icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png"></link> \
  </head> ';
	}

	returnHeader() {
		return '<body> \
        \
        <div id="saito-header" class="header header-home"> \
        <img class="saito-header-logo" src="/saito/img/logo.svg"> \
    </div>';
	}

	async returnIndexMain(page = 0) {
		let txs = await S.getInstance().getMempoolTxs();
		let balance = await this.app.wallet.getBalance();
		let balanceSaito = balance/BigInt(100000000);
		let nolansRemainder = balance - (balanceSaito * BigInt(100000000));
		
		// Update pagination controls in returnIndexMain
		const createPaginationControls = async () => {
			const totalBlocks = Number(await this.app.blockchain.getLatestBlockId());
			const totalPages = Math.ceil(totalBlocks / 200);
			const currentPage = page;
			
			let pages = [];
			const range = 5;
			
			// Always add first page
			pages.push(0);
			
			// Add pages around current page
			for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages - 2, currentPage + range); i++) {
				if (i === 1 && currentPage - range > 1) {
					pages.push('...');
				}
				pages.push(i);
				if (i === currentPage + range && currentPage + range < totalPages - 2) {
					pages.push('...');
				}
			}
			
			// Always add last page if we have more than one page
			if (totalPages > 1) {
				pages.push(totalPages - 1);
			}
			
			const pageButtons = pages.map(p => {
				if (p === '...') {
					return '<span class="page-ellipsis">...</span>';
				}
				return `<a href="/explorer?page=${p}" class="secondary-button ${p === currentPage ? 'disabled current-page' : ''}">${p + 1}</a>`;
			}).join('');

			return `
				<div class="pagination-controls">
					<a href="/explorer?page=0" class="secondary-button ${currentPage === 0 ? 'disabled' : ''}">First</a>
					<a href="/explorer?page=${Math.max(0, currentPage - 1)}" class="secondary-button ${currentPage === 0 ? 'disabled' : ''}">Previous</a>
					${pageButtons}
					<a href="/explorer?page=${currentPage + 1}" class="secondary-button ${currentPage >= totalPages - 1 ? 'disabled' : ''}">Next</a>
					<a href="/explorer?page=${totalPages - 1}" class="secondary-button ${currentPage >= totalPages - 1 ? 'disabled' : ''}">Last</a>
				</div>
			`;
		};

		const paginationControls = await createPaginationControls();

		return (
			'<div class="explorer-main explorer-main--index"> \
        <div class="block-table"> \
          <div class="explorer-data"><h4>Server Address:</h4></div> <div class="address">' +
			(await this.app.wallet.getPublicKey()) +
			'</div> \
          <div class="explorer-data"><h4>Balance:</h4> </div><div>' +
			(balanceSaito+"."+nolansRemainder) +
			'</div> \
          <div class="explorer-data"><h4>Mempool:</h4></div> <div><a href="/explorer/mempool">' +
			txs.length +
			' txs</a></div> \
        </div>' + this.returnInputBalanceHTML() +
			'\
        <div class="explorer-data"><h4>Search for Block (by hash):</h4> \
        <form method="get" action="/explorer/block"><div class="one-line-form"><input type="text" name="hash" class="hash-search-input" /> \
        <input type="submit" id="explorer-button" class="button" value="search" /></div></form> </div> \
        <div class="explorer-data"><h3>Recent Blocks:</h3></div> \
        ' + paginationControls + '\
        <div id="block-list">' +
			(await this.listBlocks(page)) +
			'</div> \
        ' + paginationControls + '\
      </div> '
		);
	}

	returnPageClose() {
		return '</body> \
        </html>';
	}

	/////////////////////
	// Main Index Page //
	/////////////////////
	async returnIndexHTML(page) {
		var html =
			this.returnHead() +
			this.returnHeader() +
			(await this.returnIndexMain(page)) +
			this.returnPageClose();
		return html;
	}

	async returnMempoolHTML() {
		let txs = await S.getInstance().getMempoolTxs();
		var html = this.returnHead();
		html += this.returnHeader();
		html += '<div class="explorer-main explorer-main--mempool">';
		html +=
			'<a class="button" href="/explorer/"><i class="fas fa-cubes"></i> back to blocks</a>';
		html +=
			'<h3>Mempool Transactions:</h3><div data-json="' +
			encodeURI(JSON.stringify(txs, null, 4)) +
			'" class="json">' +
			JSON.stringify(txs) +
			'</div></div>';
		html += this.returnInvokeJSONTree();
		html += this.returnPageClose();
		return html;
	}

	async returnBlockSourceHTML(app, hash) {
		var html = this.returnHead();
		html += this.returnHeader();
		html += '<div class="explorer-main explorer-main--block-source">';
		html +=
			'<a class="button" href="/explorer/block?hash=' +
			hash +
			'"><i class="fas fa-cubes"></i> back to block</a>';
		html +=
			'<h3>Block Source (' +
			hash +
			'):</h3><div class="blockJson"><div class="loader"></div></div>';
		html +=
			'<script> \
        fetchRawBlock("' + hash + '"); \
      </script>';
		html += this.returnPageClose();
		return html;
	}

	returnInvokeJSONTree() {
		var jstxt =
			'\n <script> \n \
    var jsonObj = document.querySelector(".json"); \n \
    var jsonTxt = decodeURI(jsonObj.dataset.json); \n \
    jsonObj.innerHTML = ""; \n \
    var tree = jsonTree.create(JSON.parse(jsonTxt), jsonObj); \n \
    </script> \n';
		return jstxt;
	}

	async listBlocks(page = 0) {
		console.log("page: ", page);
		var explorer_self = this;
		let latest_block_id = await explorer_self.app.blockchain.getLatestBlockId();

		var html = '<div class="blockchain-table">';
		html += '<div class="table-header"></div><div class="table-header">id</div><div class="table-header">block hash</div>';
		html += '<div class="table-header">tx</div><div class="table-header">previous block</div><div class="table-header">block creator</div><div class="table-header">timestamp</div>';

		const BLOCKS_PER_PAGE = 200;
		const startBlock = latest_block_id - (BigInt(page) * BigInt(BLOCKS_PER_PAGE));
		let endBlock = startBlock - BigInt(BLOCKS_PER_PAGE);
		console.log("startBlock: ", startBlock);
		console.log("endBlock: ", endBlock);
		
		// Ensure endBlock doesn't go below 0
		if (endBlock < BigInt(0)) {
			endBlock = BigInt(0);
		}

		for (var mb = startBlock; mb >= endBlock; mb--) {
			let longest_chain_hash = await explorer_self.app.blockchain.getLongestChainHashAtId(mb);
			let hashes_at_block_id = await explorer_self.app.blockchain.getHashesAtId(mb);

			for (let i = 0; i < hashes_at_block_id.length; i++) {
				let txs_in_block = 0;
				let previous_block_hash = '';
				let block_creator = '';
				let timestamp = '';

				let block = await explorer_self.app.blockchain.getBlock(hashes_at_block_id[i]);

				if (block) {
					let blk = JSON.parse(block.toJson());
					txs_in_block = block.transactions.length;
					previous_block_hash = block.previousBlockHash;
					block_creator = blk.creator;
					
					// Format timestamp with 24-hour time
					const blockTime = new Date(Number(blk.timestamp));
					const localTime = blockTime.toISOString().replace('T', ' ').slice(0, 19);
					const timeDiff = this.getTimeDifference(Number(blk.timestamp));
					timestamp = `<div class="timestamp" data-tooltip="${timeDiff}">${localTime}</div>`;
				}

				if (longest_chain_hash === hashes_at_block_id[i]) {
					html += '<div>*</div>';
				} else {
					html += '<div></div>';
				}

				html += '<div class="ellipsis"><a href="/explorer/block?hash=' + block.hash + '">' + block.id + '</a></div>';
				html += '<div class="ellipsis" title="' + block.hash + '"><a href="/explorer/block?hash=' + block.hash + '">' + block.hash + '</a></div>';
				html += '<div>' + txs_in_block + '</div>';
				html += '<div class="ellipsis" title="' + previous_block_hash + '">' + previous_block_hash + '</div>';
				html += '<div class="ellipsis" title="' + block_creator + '">' + block_creator + '</div>';
				html += timestamp;
			}
		}
		html += '</div>';
		return html;
	}

	// Fixed getTimeDifference to properly calculate time differences
	getTimeDifference(timestamp) {
		const now = Math.floor(Date.now() / 1000); // Convert current time to seconds
		const diff = now - timestamp;
		
		if (diff < 60) return 'Just now';
		if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
		if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
		return `${Math.floor(diff/86400)} days ago`;
	}

	////////////////////////
	// Single Block Page  //
	////////////////////////
	async returnBlockHTML(app, hash) {
		var html = this.returnHead() + this.returnHeader();
		html += '<div class="explorer-main explorer-main--block-explorer">';
		
		// Top navigation back to block list
		html += '<div class="block-navigation flex items-center gap-16 mt-12 mb-12">';
		html += '<a href="/explorer" class="button text-2xl"><i class="fas fa-cubes"></i> Back to Block List</a>';
		html += '</div>';
		
		html += '<h3>Block Explorer:</h3>';
		
		try {
			const this_block = await this.app.blockchain.getBlock(hash);
			if (this_block) {
				// Initial block data
				html += '<div class="txlist">';
				html += '<div class="loader"></div>';
				html += '</div>';

				// Block navigation section
				const previous_block_hash = this_block.previousBlockHash;
				const next_block_id = Number(this_block.id) + 1;
				
				html += '<div class="block-navigation--controls flex justify-center items-center gap-16 mt-8 mb-8 pt-8 border-t border-saito">';
				
				// Previous block link
				if (previous_block_hash) {
					html += `<a href="/explorer/block?hash=${previous_block_hash}" class="button">
						<i class="fas fa-chevron-left"></i> Previous Block
					</a>`;
				}
				
				// Next blocks
				try {
					const next_block_hashes = await this.app.blockchain.getHashesAtId(BigInt(next_block_id));
					if (next_block_hashes && next_block_hashes.length > 0) {
						if (next_block_hashes.length === 1) {
							html += `<a href="/explorer/block?hash=${next_block_hashes[0]}" class="button">
								Next Block <i class="fas fa-chevron-right"></i>
							</a>`;
						} else {
							// Multiple next blocks
							html += '<div class="dropdown">';
							html += '<button class="button dropdown-toggle">Next Blocks <i class="fas fa-chevron-down"></i></button>';
							html += '<div class="dropdown-content">';
							for (let i = 0; i < next_block_hashes.length; i++) {
								html += `<a href="/explorer/block?hash=${next_block_hashes[i]}">Block ${next_block_id} (${i + 1}/${next_block_hashes.length})</a>`;
							}
							html += '</div></div>';
						}
					}
				} catch (err) {
					console.log("Error fetching next blocks:", err);
				}
				
				html += '</div>'; // Close block-navigation--controls
			}
		} catch (err) {
			console.log("Error fetching block data:", err);
			html += '<div class="loader"></div>';
		}

		html += '</div>'; // Close explorer-main
		html += `<script>fetchBlock("${hash}");</script>`;
		html += this.returnPageClose();
		
		return html;
	}

	// Input Balance HTML
	returnInputBalanceHTML() {
		var html = `
		<div class="explorer-data">
			<h4>Check balance (by wallet)</h4>
			<form method="get" action="/explorer/balance">
				<div class="one-line-form">
					<input type="text" class="balance-search-input" name="pubkey">
					<input type="submit" class="button" value="check">
				</div>
			</form>
		</div>
		`;

		return html;
	}

	// Balance HTML
	async returnBalanceHTML(app, pubkey) {
		var html = this.returnHead() + this.returnHeader();

		html += `
		<div class="explorer-main explorer-main--balance">
			<div class="block-table">
				<div class="explorer-data">
					<h4>Wallet Address:</h4>
				</div>
				<div class="address">` + pubkey + `</div>
				<div class="explorer-data">
					<h4>Saito:</h4>
				</div>
				<div class="balance-saito">-</div>
				<div class="explorer-data">
					<h4>Nolan:</h4>
				</div>
				<div class="balance-nolan">-</div>
			</div>
			<div class="explorer-balance-row">
				<h4>Check balance (by wallet)</h4>
				<form method="get" action="/explorer/balance">
					<div class="one-line-form">
						<input type="text" class="balance-search-input" name="pubkey" >
						<input type="submit" class="balance-button" value="check">
						<a href="/explorer/balance/all" class="balance-button">Show all</a>
					</div>
				</form>
			</div>
			<div class="explorer-balance-row-button">
				<a href="/explorer">
					<button class="balance-button"><i class="fas fa-cubes"></i> Back to explorer</button>
				</a>
			</div>
		</div>
		<script>
			checkBalance("`+ pubkey + `");
		</script>
		`;
		html += this.returnPageClose();
		return html;
	}

	async returnAllBalanceHTML(app) {
		var html = this.returnHead() + this.returnHeader();

		html += `
		<div class="explorer-main explorer-main--all-balance">
		
			<div class="explorer-balance-row">
				<a href="/explorer">
					<button class="balance-button"><i class="fas fa-cubes"></i> Back to explorer</button>
				</a>
			</div>
			<h2>Holders</h2>
			<h3>Total Supply</h3>
			<div class="block-table">
				<div class="explorer-data">
					<h4>Saito:</h4>
				</div>
				<div class="balance-saito">-</div>
				<div class="explorer-data">
					<h4>Nolan:</h4>
				</div>
				<div class="balance-nolan">-</div>
			</div>

			<div class="explorer-balance-row">
				<div class="explorer-balance-table">
					<div class="explorer-balance-header">Wallet</div>
					<div class="explorer-balance-header">Saito</div>
					<div class="explorer-balance-header">Nolan</div>
				</div>
			</div>
		</div>
		<script>
			checkAllBalance();
		</script>
		`;
		html += this.returnPageClose();
		return html;
	}

	shouldAffixCallbackToModule() {
		return 1;
	}
}

module.exports = ExplorerCore;
