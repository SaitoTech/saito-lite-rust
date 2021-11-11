const Block = require('./block');
const Storage = require('./storage');
const NetworkApi = require('./networkapi');
const Crypto = require('./crypto');

test("write_read_block_to_file", async () => {
    let mockApp = {};
    let networkApi = new NetworkApi(mockApp);
    let crypto = new Crypto(mockApp);
    mockApp.networkApi = networkApi;
    mockApp.crypto = crypto;

    let block = new Block(mockApp);

    let storage = new Storage(mockApp);
    let result = await storage.saveBlock(block);
    expect(result).toBeTruthy();

    let block2 = await storage.loadBlockFromDisk(result);
    expect(block2.block.id).toEqual(block.block.id);
});
