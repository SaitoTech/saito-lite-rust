class RequestBlockchainMessage {
    latest_block_id = 0;
    latest_block_hash = Buffer.alloc(32, 0);
    fork_id = Buffer.alloc(32, 0);
    app = {};

    constructor(app, latest_block_id, latest_block_hash, fork_id) {
        this.app = app;
        this.latest_block_id = latest_block_id;
        this.latest_block_hash = latest_block_hash;
        this.fork_id = fork_id;
    }

    static deserialize(bytes, app) {
        let block_id = app.binary.u64FromBytes(Buffer.from(bytes.slice(0, 8)));
        if (!block_id) { // for initial request
            return new RequestBlockchainMessage(app, 0, Buffer.alloc(32, 0), Buffer.alloc(32, 0));
        }
        let hash = bytes.slice(8, 40);
        let fork_id = bytes.slice(40, 72);

        return new RequestBlockchainMessage(app, Number(block_id), hash, fork_id);
    }

    serialize() {
        return Buffer.concat([this.app.binary.u64AsBytes(this.latest_block_id), this.latest_block_hash, this.fork_id]);
    }
}

module.exports = RequestBlockchainMessage;
