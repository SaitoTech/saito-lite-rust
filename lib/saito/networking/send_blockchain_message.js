const SyncType = {
    Full: 0,
    Lite: 1,
};

const BlockchainBlockDataSize = 84;

class SendBlockchainBlockData {
    block_id = BigInt(0);
    block_hash = [];
    timestamp = BigInt(0);
    pre_hash = [];
    number_of_transactions = 0;

    constructor(block_id, block_hash, timestamp, pre_hash, number_of_transactions) {
        this.block_id = block_id;
        this.block_hash = block_hash;
        this.timestamp = timestamp;
        this.pre_hash = pre_hash;
        this.number_of_transactions = number_of_transactions;
    }
}

class SendBlockchainMessage {
    sync_type = undefined;
    starting_hash = [];
    blocks_data = [];
    app = {};

    constructor(sync_type, starting_hash, blocks_data, app) {
        this.sync_type = sync_type;
        this.starting_hash = starting_hash;
        this.blocks_data = blocks_data;
        this.app = app;
    }

    static deserialize(bytes, app) {
        let sync_type = bytes[0];
        let starting_hash = bytes.slice(1, 33);
        let blocks_data_len = app.binary.u32FromBytes(bytes.slice(33, 37));
        let blocks_data = [];
        let start_of_block_data = 37;
        for (let i = 0; i < blocks_data_len; ++i) {
            let start_of_data = start_of_block_data + i * BlockchainBlockDataSize;
            let block_id = app.binary.u64FromBytes(bytes.slice(start_of_data, start_of_data + 40));
            let block_hash = bytes.slice(start_of_data + 8, start_of_data + 40);
            let timestamp = app.binary.u64FromBytes(bytes.slice(start_of_data + 40, start_of_data + 48));
            let pre_hash = bytes.slice(start_of_data + 48, start_of_data + 88);
            let number_of_transactions = app.binary.u32FromBytes(bytes.slice(start_of_data + 80, start_of_data + 84));

            blocks_data.push(new SendBlockchainBlockData(block_id, block_hash, timestamp, pre_hash, number_of_transactions));
        }

        return new SendBlockchainMessage(sync_type, starting_hash, blocks_data, app);
    }

    serialize() {
        console.log("SendBlockchainMessage.serialize", this);
        let bytes = Buffer.concat([Buffer.from([this.app.binary.u8AsByte(this.sync_type)]),
                                      Buffer.from(this.starting_hash),
                                      Buffer.from(this.app.binary.u32AsBytes(this.blocks_data.length))]);
        for (let block of this.blocks_data) {
            bytes = Buffer.concat([bytes,
                                      Buffer.from(this.app.binary.u64AsBytes(block.block_id)),
                                      Buffer.from(block.block_hash),
                                      Buffer.from(this.app.binary.u64AsBytes(block.timestamp)),
                                      Buffer.from(block.pre_hash),
                                      Buffer.from(this.app.binary.u32AsBytes(block.number_of_transactions))
                                  ]);
        }
        return bytes;
    }
}

SendBlockchainMessage.SendBlockchainBlockData = SendBlockchainBlockData;
SendBlockchainMessage.SyncType = SyncType;

module.exports = SendBlockchainMessage;
