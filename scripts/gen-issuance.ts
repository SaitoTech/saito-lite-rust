import { NodeSharedMethods } from '../lib/saito/core/server';
import StorageCore from '../lib/saito/core/storage-core';
import { Saito, parseLogLevel } from '../apps/core';
import S, { initialize as initS } from 'saito-js/index.node';
import mods_config from '../config/modules.config.js';
import Factory from '../lib/saito/factory';
import process from 'process';

function getCommandLineArg(key) {
    const index = process.argv.findIndex((arg) => arg === key);
    if (index === -1) {
        return null;
    }
    return process.argv[index + 1];
}

async function genIssuance() {
    const app = new Saito({
        mod_paths: mods_config.core
    });

    let threshold = BigInt(getCommandLineArg('--threshold') || '0');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    app.storage = new StorageCore(app);

    await app.storage.initialize();
    let privateKey = app.options.wallet?.privateKey || '';
    let logLevel = parseLogLevel('debug');

    await initS(
        app.options,
        new NodeSharedMethods(app),
        new Factory(),
        privateKey,
        logLevel,
        BigInt(1),
        false
    ).then(() => {
        console.log('saito wasm lib initialized');
    });

    console.log('threshold set as ' + threshold);
    await S.getInstance().writeIssuanceFile(threshold);
}

genIssuance().catch((e) => console.error(e));
