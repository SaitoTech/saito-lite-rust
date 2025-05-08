const ModTemplate = require('../../lib/templates/modtemplate');
const sanitizer   = require('sanitizer');
const JSONbig     = require('json-bigint');
const ATRMain     = require('./lib/main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const HomePage    = require('./index');

let SaitoS = require('saito-js/saito');
const S     = SaitoS.default || SaitoS;

class ATR extends ModTemplate {

  constructor(app) {
    super(app);
    this.app           = app;
    this.name          = 'ATR';
    this.slug          = 'atr';
    this.description   = `Explorer for ATR Testing`;
    this.categories    = 'Utilities Dev';
    this.class         = 'utility';
    this.ui            = null;
    this.blocks        = [];
    this.last_block_id = 0;
    this.serverCache   = new Map();

    this.social = {
      twitter:     '@SaitoOfficial',
      title:       'Saito ATR Explorer',
      url:         'https://saito.io/atr/',
      description: 'ATR explorer for Saito Network blockchain',
      image:
        'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png'
    };
  }

  async initialize(app) {
    await super.initialize(app);
    this.ui     = new ATRMain(app, this);
    this.header = new SaitoHeader(app, this);
  }

  shouldAffixCallbackToModule() { return 1; }

  async render(app) {
    this.addComponent(this.header);
    await this.loadBlocks(null, 'old');
    this.styles = ['/atr/style.css'];
    await super.render(app);
  }

  async loadBlocks(blk = null, type) {
    try {
      if (blk === null) {
        let lastHash = await this.app.blockchain.getLastBlockHash();
        for (let i = 0; i < 10; i++) {
          const fetched = await this.fetchBlock(lastHash);
          if (!fetched || Number(fetched.id) < 1) break;
          if (this.blocks.length < 10) this.blocks.push(fetched);
          lastHash = fetched.previous_block_hash;
        }
        if (this.blocks.length) {
          this.blocks.reverse();
          this.last_block_id = this.blocks[this.blocks.length - 1].id;
        }
        this.ui.render();
      }
      else if (type === 'server') {
        const blkData = await this.getBlockData(blk, 'server');
        const bhash   = blk.hash || (typeof blk.returnHash === 'function' ? blk.returnHash() : null);
         if (bhash) {
          this.serverCache.set(bhash, blkData);

          if (this.serverCache.size > 10) {
            const firstKey = this.serverCache.keys().next().value;
            this.serverCache.delete(firstKey);
          }
        }

      }
      else {
        const blkData = await this.getBlockData(blk, 'new');
        if (Number(blkData.id) > this.last_block_id) {
          this.last_block_id = Number(blkData.id);
          if (this.blocks.length >= 10) this.blocks.shift();
          this.blocks.push(blkData);
        }
        this.ui.render();
      }
    } catch (err) {
      console.error('Err in loadBlocks:', err);
    }
  }

  async getBlockData(blk, type) {
    const {
      id, totalFees, totalFeesNew, totalFeesAtr, totalFeesCumulative,
      avgTotalFees, avgTotalFeesNew, avgTotalFeesAtr,
      totalPayoutRouting, totalPayoutMining, totalPayoutTreasury,
      totalPayoutGraveyard, totalPayoutAtr,
      avgPayoutRouting, avgPayoutMining,
      avgPayoutTreasury, avgPayoutGraveyard, avgPayoutAtr,
      avgFeePerByte, feePerByte, avgNolanRebroadcastPerBlock,
      burnFee, difficulty, previousBlockUnpaid,
      hasGoldenTicket, treasury, graveyard
    } = blk;

    let atr_obj = {
      id,
      totalFees, totalFeesNew, totalFeesAtr, totalFeesCumulative,
      avgTotalFees, avgTotalFeesNew, avgTotalFeesAtr,
      totalPayoutRouting, totalPayoutMining, totalPayoutTreasury,
      totalPayoutGraveyard, totalPayoutAtr,
      avgPayoutRouting, avgPayoutMining,
      avgPayoutTreasury, avgPayoutGraveyard, avgPayoutAtr,
      avgFeePerByte, feePerByte, avgNolanRebroadcastPerBlock,
      burnFee, difficulty, previousBlockUnpaid,
      hasGoldenTicket, treasury, graveyard
    };

    if (type === 'old') {
      atr_obj.utxo         = '-';
      atr_obj.total_supply = '-';
    }
    else if (type === 'server') {
      if (this.app.BROWSER === 0) {
        // now calls the real getInstance()
        const data      = (await S.getInstance().getBalanceSnapshot([])).toString();
        const parts     = data.split(' ');
        const nums      = parts.slice(1).filter(s => s.includes('\n')).map(s => s.split('\n')[0]);
        const utxoTotal = nums.reduce((acc, n) => acc + BigInt(n), BigInt(0));
        atr_obj.utxo         = utxoTotal;
        atr_obj.total_supply = utxoTotal
          + BigInt(treasury)
          + BigInt(graveyard)
          + BigInt(totalFees)
          + BigInt(previousBlockUnpaid);
      } else {
        atr_obj.utxo         = '-';
        atr_obj.total_supply = '-';
      }

    }
    else {
      const snapshot = await this.fetchBalanceSnapshot('');
      atr_obj.utxo = snapshot.utxo;
      atr_obj.total_supply = snapshot.utxo
        + BigInt(treasury)
        + BigInt(graveyard)
        + BigInt(totalFees)
        + BigInt(previousBlockUnpaid);
      if (type === 'new' && Number(blk.id) !== snapshot.latestBlockId) {
        console.warn(`Block ID mismatch: blk.id=${blk.id}, latest=${snapshot.latestBlockId}`);
      }
    }

    const fullblock               = JSONbig.parse(blk.toJson());
    atr_obj.previous_block_hash   = fullblock.previous_block_hash;
    return atr_obj;
  }

  async fetchBlock(hash) {
    try {
      const res = await fetch(`${window.location.origin}/atr/json-block/${hash}`);
      return await res.json();
    } catch (err) {
      console.error('Error fetching block:', err);
      return null;
    }
  }

  webServer(app, expressapp, express) {
    const webdir   = `${__dirname}/../../mods/${this.dirname}/web`;
    const atr_self = app.modules.returnModule('ATR');

    expressapp.get(`/${encodeURI(this.returnSlug())}`, (req, res) => {
      const base = `${req.protocol}://${req.headers.host}/`;
      atr_self.social.url = base + encodeURI(atr_self.returnSlug());
      res.setHeader('Content-Type','text/html');
      res.charset = 'UTF-8';
      res.send(HomePage(app, atr_self, app.build_number, atr_self.social));
    });

    expressapp.get('/atr/json-block/:bhash', async (req, res) => {
      const bhash = req.params.bhash;
      if (atr_self.serverCache.has(bhash)) {
        return res.status(200).send(JSON.stringify(atr_self.serverCache.get(bhash)));
      }
      try {
        const blk = await app.blockchain.getBlock(bhash);
        if (!blk) return res.status(200).send('{}');
        const obj = await atr_self.getBlockData(blk, 'old');
        return res.status(200).send(JSON.stringify(obj));
      } catch (err) {
        console.error('JSON-BLOCK ERROR:', err);
        return res.status(400).json({ error: { message: `Could not find block ${bhash}` }});
      }
    });

    expressapp.get('/atr/cv/latest', async (req, res) => {
      try {
        const lastHash = await this.app.blockchain.getLastBlockHash();
        if (atr_self.serverCache.has(lastHash)) {
          return res.status(200).send(JSON.stringify(atr_self.serverCache.get(lastHash)));
        }
        const blk = await app.blockchain.getBlock(lastHash);
        if (!blk) return res.status(200).send('{}');
        const obj = await atr_self.getBlockData(blk, 'server');
        atr_self.serverCache.set(lastHash, obj);
        return res.status(200).send(JSON.stringify(obj));
      } catch (err) {
        console.error('LATEST ERROR:', err);
        return res.status(400).json({ error: { message: 'Failed to fetch latest block' }});
      }
    });

    expressapp.get('/atr/cache', (req, res) => {
      const allData = Object.fromEntries(atr_self.serverCache.entries());
      return res.status(200).json(allData);
    });

    expressapp.use(`/${encodeURI(this.returnSlug())}`, express.static(webdir));
  }

  async onNewBlock(blk, lc) {
    if (this.app.BROWSER === 0) {
      await this.loadBlocks(blk, 'server');
    } else {
      await this.loadBlocks(blk, 'new');
    }
  }

  async onConfirmation(blk, tx, conf) {
    if (this.app.BROWSER === 0) return;
    if (conf === 0) await this.loadBlocks(blk, 'new');
  }

  async handlePeerTransaction(app, tx = null, peer, cb = null) {
    if (!tx) return;
    const m = tx.returnMessage();
    if (m.request === 'new-block-with-gt') {
      await app.wallet.produceBlockWithGt();
      return 0;
    } else if (m.request === 'new-block-with-no-gt') {
      await app.wallet.produceBlockWithoutGt();
      return 0;
    }
    return super.handlePeerTransaction(app, tx, peer, cb);
  }

  async fetchBalanceSnapshot(key) {
    try {
      const res  = await fetch('/balance/' + key);
      const txt  = await res.text();
      const parts= txt.split(' ');
      const nums = parts.slice(1)
        .filter(s => s.includes('\n'))
        .map(s => s.split('\n')[0]);
      const utxo = nums.reduce((a,n) => a + BigInt(n), BigInt(0));
      const first= txt.trim().split('\n')[0];
      const m    = first.match(/-(\d+)-/);
      return { utxo, latestBlockId: m ? Number(m[1]) : 0 };
    } catch (err) {
      console.error(err);
      return { utxo: BigInt(0), latestBlockId: 0 };
    }
  }

  async getBalanceString(balance = null) {
    if (balance === null) balance = await this.app.wallet.getBalance();
    const saito = balance / BigInt(100000000);
    const rem   = balance - saito * BigInt(100000000);
    return Number(`${saito}.${rem}`).toFixed(2);
  }
}

module.exports = ATR;
