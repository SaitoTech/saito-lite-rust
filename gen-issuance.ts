import { NodeSharedMethods } from './lib/saito/core/server';
import StorageCore from './lib/saito/core/storage-core';
import { Saito, parseLogLevel } from './apps/core';
import S, { initialize as initS } from 'saito-js/index.node';
import mods_config from './config/modules.config.js';
import Factory from './lib/saito/factory';

async function genIssuance() {
	const app = new Saito({
		mod_paths: mods_config.core
	});

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	app.storage = new StorageCore(app);

	await app.storage.initialize();
	let privateKey = app.options.wallet?.privateKey || '';
	let logLevel = parseLogLevel('info');

	await initS(
		app.options,
		new NodeSharedMethods(app),
		new Factory(),
		privateKey,
		logLevel
	).then(() => {
		console.log('saito wasm lib initialized');
	});

	await S.getInstance().writeIssuanceFile(BigInt(25000));
}

genIssuance().catch((e) => console.error(e));
