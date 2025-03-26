import express from 'express';
import path from 'path';
import { ModTemplate } from '../../lib/templates/modtemplate';

class ExplorerX extends ModTemplate {
  constructor(app: any) {
    super(app);
    this.name = 'ExplorerX';
    this.slug = 'explorerx';
    this.description = 'Modern React-based block explorer for the Saito blockchain';
    this.categories = 'Utilities Dev';
  }

  webServer(app: any, expressapp: express.Application) {
    expressapp.use('/explorerx', express.static(path.join(__dirname, 'web/dist')));
    
    // API endpoints
    expressapp.get('/explorerx/api/block/:hash', async (req, res) => {
      try {
        const block = await this.app.blockchain.getBlock(req.params.hash);
        res.json(block.toJson());
      } catch (err) {
        res.status(404).json({ error: 'Block not found' });
      }
    });

    expressapp.get('/explorerx/api/blocks/:page', async (req, res) => {
      try {
        const page = parseInt(req.params.page) || 0;
        const latest_block_id = await this.app.blockchain.getLatestBlockId();
        const BLOCKS_PER_PAGE = 200;
        const blocks = [];
        
        const startBlock = latest_block_id - (BigInt(page) * BigInt(BLOCKS_PER_PAGE));
        let endBlock = startBlock - BigInt(BLOCKS_PER_PAGE);
        if (endBlock < BigInt(0)) endBlock = BigInt(0);

        for (let id = startBlock; id >= endBlock; id--) {
          const hash = await this.app.blockchain.getLongestChainHashAtId(id);
          if (hash) {
            const block = await this.app.blockchain.getBlock(hash);
            blocks.push(block.toJson());
          }
        }

        res.json({
          blocks,
          totalBlocks: latest_block_id.toString(),
          currentPage: page
        });
      } catch (err) {
        res.status(500).json({ error: 'Error fetching blocks' });
      }
    });

    expressapp.get('/explorerx/api/balance/:address', async (req, res) => {
      try {
        const balance = await this.app.blockchain.getBalance(req.params.address);
        res.json({ balance: balance.toString() });
      } catch (err) {
        res.status(500).json({ error: 'Error fetching balance' });
      }
    });
  }
}

export default ExplorerX; 