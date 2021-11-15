const saito = require('./saito');
const fs = require("fs-extra");
const blake3 = require("blake3");
const Big = require("big.js");

test("write_read_empty_block_to_file", async () => {
    fs.emptyDirSync("./data/blocks");

    let mockApp = {};
    let networkApi = new saito.networkApi(mockApp);
    let crypto = new saito.crypto(mockApp);
    let binary = new saito.binary(mockApp);
    mockApp.networkApi = networkApi;
    mockApp.crypto = crypto;
    mockApp.binary = binary;
    mockApp.hash = (data) => {
        return blake3.hash(data).toString('hex');
    };

    let block = new saito.block(mockApp);

    let storage = new saito.storage(mockApp);
    let result = await storage.saveBlock(block);
    expect(result).toBeTruthy();

    let block2 = await storage.loadBlockFromDisk(result);
    expect(block2).toBeTruthy();
    expect(block2.block.id).toEqual(block.block.id);
    expect(block2.hash).toEqual(block.hash);
    expect(block2.prehash).toEqual(block.prehash);
});

test("write_read_block_with_data_to_file", async () => {
    fs.emptyDirSync("./data/blocks");

    let mockApp = {};
    let networkApi = new saito.networkApi(mockApp);
    let crypto = new saito.crypto(mockApp);
    let binary = new saito.binary(mockApp);
    mockApp.networkApi = networkApi;
    mockApp.crypto = crypto;
    mockApp.binary = binary;
    mockApp.hash = (data) => {
        return blake3.hash(data).toString('hex');
    };

    let block = new saito.block(mockApp);
    block.block.id = 10;
    block.block.previous_block_hash = "bcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
    block.block.merkle = "ccf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b";
    block.block.creator = "dcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8bc";
    block.block.burnfee = 50000000;
    block.block.difficulty = 0;
    block.block.treasury = Big("0");
    block.block.staking_treasury = Big("0");
    block.block.signature = "0326eca18ab5c0d95a473b2d7aa894bc8b0d0ea45fd7d25ce9b540e847544d300dcdd32267217134bcb1c9288f0cacd8c8f10a322f81af095579b871d584e05f9fa4a9499e9a1e3685b0d232323f4af52b1f22648ffa7c65e1e0b7a10d85fbb36c02df45be0678741d7b927466fc34faf80e9cbefb0e113c916a7d4c50cafc68e6";

    block.generateMetadata();

    let storage = new saito.storage(mockApp);
    let result = await storage.saveBlock(block);
    expect(result).toBeTruthy();

    let block2 = await storage.loadBlockFromDisk(result);
    expect(block2).toBeTruthy();
    expect(block2.block.id).toEqual(block.block.id);
    expect(block2.previous_block_hash).toEqual(block.block.previous_block_hash);
    expect(block2.block.merkle).toEqual(block.block.merkle);
    expect(block2.block.creator).toEqual(block.block.creator);
    expect(block2.block.burnfee).toEqual(block.block.burnfee);
    expect(block2.block.difficulty).toEqual(block.block.difficulty);
    expect(block2.block.treasury).toEqual(block.block.treasury);
    expect(block2.block.staking_treasury).toEqual(block.block.staking_treasury);
    expect(block2.block.signature).toEqual(block.block.signature);
    expect(block2.block.burnfee).toEqual(block.block.burnfee);
    expect(block2.hash).toEqual(block.hash);
    expect(block2.prehash).toEqual(block.prehash);
});

test.skip("read_block_from_disk (from rust generated block)", async () => {
    let mockApp = {};
    let networkApi = new saito.networkApi(mockApp);
    let crypto = new saito.crypto(mockApp);
    let binary = new saito.binary(mockApp);
    mockApp.networkApi = networkApi;
    mockApp.crypto = crypto;
    mockApp.binary = binary;
    mockApp.hash = (data) => {
        return blake3.hash(data).toString('hex');
    };

    let storage = new saito.storage(mockApp);

    let block = new saito.block(mockApp);

    let block2 = await storage.loadBlockFromDisk("./data/blocks/0000017d22813455-bcf6cceb74717f98c3f7239459bb36fdcd8f350eedbfccfbebf7c0b0161fcd8b.sai");
    console.log(process.cwd())
    expect(block2).toBeTruthy();
    expect(block2.block.id).toEqual(block.block.id);
    expect(block2.block.burnfee).toEqual(block2.block.burnfee);
});
