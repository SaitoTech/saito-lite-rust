import SaitoBlock from 'saito-js/lib/block';

export default class Block extends SaitoBlock {
	public force: boolean;

	public txs_hmap: Map<string, number>;
	public txs_hmap_generated: boolean;
	public has_examined_block: boolean;

	constructor(data: any | undefined = undefined) {
		super(data);

		// this.lc = false;
		this.force = false; // set to true if "force" loaded -- used to avoid duplicating callbacks

		this.txs_hmap = new Map<string, number>();
		this.txs_hmap_generated = false;

		this.has_examined_block = false;
	}
}
