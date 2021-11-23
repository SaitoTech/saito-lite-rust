class RequestBlockchainMessage {
    latest_block_id = BigInt(0);
    latest_block_hash = [];
    fork_id = [];
    app = {};

    constructor(app,latest_block_id, latest_block_hash, fork_id) {
        this.app = app;
        this.latest_block_id = latest_block_id;
        this.latest_block_hash = latest_block_hash;
        this.fork_id = fork_id;
    }

    static deserialize(bytes,app){
        let block_id = app.binary.u64FromBytes(bytes.slice(0, 8));
        let hash = bytes.slice(8,40);
        let fork_id = bytes.slice(40, 72);

        return new RequestBlockchainMessage(app, block_id, hash, fork_id);
    }
    serialize(){
        return Buffer.concat([this.app.binary.u64AsBytes(this.latest_block_id), this.latest_block_hash, this.fork_id]);
    }
}
