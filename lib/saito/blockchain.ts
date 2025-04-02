import Saito from 'saito-js/saito';
import SaitoBlockchain from 'saito-js/lib/blockchain';
import Block from './block';
import { Saito as S } from '../../apps/core';
import { TransactionType } from 'saito-js/lib/transaction';
import Transaction from './transaction';
import { BlockType } from 'saito-js/lib/block';
import { DefaultEmptyBlockHash } from 'saito-js/lib/wallet';

export default class Blockchain extends SaitoBlockchain {
	public app: S;

	constructor(data) {
		super(data);
	}

	public async getBlock(blockHash: string): Promise<Block> {
		let block = await Saito.getInstance().getBlock(blockHash);

		return block as unknown as Block;
	}

	async resetBlockchain() {
		this.app.options.blockchain = {
			last_block_hash: DefaultEmptyBlockHash,
			last_block_id: 0,
			last_timestamp: 0,
			genesis_block_id: 0,
			genesis_timestamp: 0,
			lowest_acceptable_timestamp: 0,
			lowest_acceptable_block_hash: DefaultEmptyBlockHash,
			lowest_acceptable_block_id: 0,
			fork_id: DefaultEmptyBlockHash
		};
		this.instance.reset();
		await this.saveBlockchain();
	}

	async saveBlockchain() {
		this.app.options.blockchain = {
			last_block_hash: await this.instance.get_last_block_hash(),
			last_block_id: Number(await this.instance.get_last_block_id()),
			last_timestamp: Number(await this.instance.get_last_timestamp()),
			genesis_block_id: Number(
				await this.instance.get_genesis_block_id()
			),
			genesis_timestamp: Number(
				await this.instance.get_genesis_timestamp()
			),
			lowest_acceptable_timestamp: Number(
				await this.instance.get_lowest_acceptable_timestamp()
			),
			lowest_acceptable_block_hash:
				await this.instance.get_lowest_acceptable_block_hash(),
			lowest_acceptable_block_id: Number(
				await this.instance.get_lowest_acceptable_block_id()
			),
			fork_id: await this.instance.get_fork_id()
		};
		this.app.storage.saveOptions();
	}

	async loadBlockAsync(hash: string): Promise<Block | null> {
		let block: Block = await Saito.getInstance().getBlock(hash);
		if (block.block_type === BlockType.Full) {
			return block;
		} else if (block.block_type === BlockType.Pruned) {
			let block = await this.app.storage.loadBlockByHash(hash);
			if (!block || block.block_type === BlockType.Full) {
				return block;
			}
		}
		return null;
	}

	async initialize() {
		this.app.connection.on(
			'add-block-success',
			async ({ blockId, hash }) => {
console.log("before onAddBlockSuccess...");
				await this.onAddBlockSuccess(blockId, hash);
console.log("after onAddBlockSuccess...");
			}
		);
	}

	public async affixCallbacks(block: Block) {

console.log("============");
console.log("IN BLOCK: " + block.id);

		let callbacks = [];
		let callbackIndices = [];

		let txs: Transaction[] = block.transactions as Transaction[];
console.log("how many txs: " + txs.length);
		let validTxs = 0;
		for (let z = 0; z < txs.length; z++) {
			if (txs[z].type === TransactionType.Normal) {
				let txmsg2 = txs[z].returnMessage();

        const str_txmsg2 = JSON.stringify(txmsg2);
        const ellipsis = "\n...\n";
        const prefixLength = 500, suffixLength = 500;
        const maxStrLength =
          prefixLength + ellipsis.length + suffixLength;
        /*
		  console.log(
          "examining tx:",
          str_txmsg2.length > maxStrLength ?
              str_txmsg2.slice(0, prefixLength)
                + ellipsis + str_txmsg2.slice(-suffixLength)
            : str_txmsg2
        );
        */

        //console.log("processing tx!");
				await txs[z].decryptMessage(this.app);
				const txmsg = txs[z].returnMessage();
				this.app.modules.affixCallbacks(
					txs[z],
					z,
					txmsg,
					callbacks,
					callbackIndices
				);
				console.assert(
					callbacks.length === callbackIndices.length,
					'callback lengths are not matching after block : ' +
						block.hash
				);
				validTxs++;
			}
		}
console.log("============");
		this.callbacks.set(block.hash, callbacks);
		this.callbackIndices.set(block.hash, callbackIndices);
		this.confirmations.set(block.hash, BigInt(-1));
	
		await this.instance.set_safe_to_prune_transaction(block.id);

	}

	public async onNewBlock(block: Block, lc: boolean) {
		await this.saveBlockchain();
		this.app.modules.onNewBlock(block, lc);
	}

	public async getLastBlockHash() {
		let hash = await this.instance.get_last_block_hash();
		return hash;
	}
}
