class SendBlockHeadMessage {
    block_hash = [];

    constructor(block_hash) {
        this.block_hash = block_hash;
    }
    static deserialize(bytes){
        let block_hash = bytes.slice(0, 32);
        return new SendBlockHeadMessage(block_hash);
    }
    serialize(){
        return Buffer.from(this.block_hash);
    }
}
