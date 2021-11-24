const BlockIdMask = 1;
const BlockHashMask = 2;
const SyncTypeMask = 4;

class RequestBlockMessage {
    block_id = undefined;
    block_hash = undefined;
    sync_type = undefined;
    app = {};

    constructor(block_id, block_hash, sync_type, app) {
        this.block_id = block_id;
        this.block_hash = block_hash;
        this.sync_type = sync_type;
        this.app = app;
    }

    static deserialize(bytes, app) {
        let has_block_id = BlockIdMask & bytes[0];
        let has_block_hash = BlockHashMask & bytes[0];
        let has_sync_type = SyncTypeMask & bytes[0];

        let block_id = undefined;
        let block_hash = undefined;
        let sync_type = undefined;

        if (has_block_id) {
            block_id = app.binary.u64FromBytes(bytes.slice(1, 9));
        }
        if (has_block_hash) {
            block_hash = bytes.slice(9, 41);
        }
        if (has_sync_type) {
            sync_type = bytes[41];
        }

        return new RequestBlockMessage(block_id, block_hash, sync_type, app);
    }

    serialize() {
        let array = [
            Buffer.from([(this.block_id === undefined ? BlockIdMask : 0) + (this.block_hash === undefined ? BlockHashMask : 0) + (this.sync_type === undefined ? SyncTypeMask : 0)]),
        ];
        if (this.block_id !== undefined) {
            array.push(this.app.binary.u64AsBytes(this.block_id));
        } else {
            array.push(Buffer.alloc(8, 0));
        }
        if (this.block_hash !== undefined) {
            array.push(this.block_hash);
        } else {
            array.push(Buffer.alloc(32, 0));
        }
        if (this.sync_type !== undefined) {
            array.push(Buffer.from([this.sync_type]));
        } else {
            array.push(Buffer.from([0]));
        }
        return Buffer.concat(array);
    }
}

module.exports = RequestBlockMessage;
