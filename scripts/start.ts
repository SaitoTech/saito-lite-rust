import Server, { NodeSharedMethods } from '../lib/saito/core/server';
import StorageCore from '../lib/saito/core/storage-core';
import { Saito, parseLogLevel } from '../apps/core/index';
import S, { initialize as initS } from 'saito-js/index.node';
import mods_config from '../config/modules.config.js';
import process from 'process';
import Factory from '../lib/saito/factory';
import Wallet from '../lib/saito/wallet';
import Blockchain from '../lib/saito/blockchain';
import { LogLevel } from 'saito-js/saito';



function getCommandLineArg(key) {
	const prefix = key + '=';
	const arg = process.argv.find((arg) => arg.startsWith(prefix));
	return arg ? arg.slice(prefix.length) : null;
}

async function initSaito() {
	Error.stackTraceLimit = 20;
	const app = new Saito({
		mod_paths: mods_config.core
	});

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	app.storage = new StorageCore(app);

	app.BROWSER = 0;
	app.SPVMODE = 0;
	// set basedir
	global.__webdir = __dirname + '/lib/saito/web/';
	await app.storage.initialize();
	let privateKey = app.options.wallet?.privateKey || '';
	let logLevelArg = getCommandLineArg('l') || getCommandLineArg('loglevel');
	let envLogLevel = process.env.SAITO_LOG_LEVEL;
	let logLevel = parseLogLevel(logLevelArg || envLogLevel || 'info');

	await initS(
		app.options,
		new NodeSharedMethods(app),
		new Factory(),
		privateKey,
		logLevel,
		BigInt(1),
		true,
	).then(() => {
		console.log('saito wasm lib initialized');
	});

	// enable it for ATR testing
	//await S.getInstance().disableProducingBlocksByTimer();

	app.wallet = (await S.getInstance().getWallet()) as Wallet;
	app.wallet.app = app;
	app.blockchain = (await S.getInstance().getBlockchain()) as Blockchain;
	app.blockchain.app = app;
	app.server = new Server(app);

	await app.init();

	if (app.options.blockchain.fork_id){
		await app.blockchain.setForkId(app.options.blockchain.fork_id);
	}

	S.getInstance().start();

	const { protocol, host, port } = app.options.server;

	const localServer = `${protocol}://${host}:${port}`;

	console.log(`

                                           
                     ◼◼◼                   
                  ◼◼   ◼ ◼◼                
               ◼◼◼      ◼  ◼◼◼             
            ◼◼◼          ◼    ◼◼◼          
         ◼◼◼              ◼      ◼◼◼       
       ◼◼◼                 ◼       ◼◼◼     
    ◼◼◼                     ◼         ◼◼◼  
   ◼◼◼                       ◼         ◼◼◼ 
   ◼  ◼◼◼                     ◼     ◼◼◼  ◼ 
   ◼     ◼◼◼                   ◼  ◼◼◼    ◼ 
   ◼       ◼◼◼                 ◼◼◼       ◼ 
   ◼        ◼ ◼◼◼           ◼◼◼          ◼ 
   ◼       ◼     ◼◼◼     ◼◼◼             ◼
   ◼      ◼         ◼◼ ◼◼                ◼ 
   ◼     ◼            ◼                  ◼ 
   ◼    ◼             ◼                  ◼ 
   ◼   ◼              ◼                  ◼ 
   ◼  ◼               ◼                  ◼ 
   ◼ ◼                ◼                  ◼ 
   ◼◼                 ◼                  ◼ 
   ◼◼                 ◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼ 
    ◼◼◼               ◼               ◼◼◼  
       ◼◼◼            ◼            ◼◼◼     
         ◼◼◼          ◼          ◼◼◼       
            ◼◼◼       ◼       ◼◼◼          
               ◼◼◼    ◼    ◼◼◼             
                  ◼◼  ◼  ◼◼                
                     ◼◼◼                   
                                           
    ################################################################

    Welcome to Saito

    address: ${await app.wallet.getPublicKey()}
    balance: ${await app.wallet.getBalance()}
    local module server: ${localServer}

    ################################################################

    This is the address and balance of your computer on the Saito network. Once Saito
    is running it will generate tokens automatically over time. The more transactions
    you process the greater the chance that you will be rewarded for the work.

    For inquiries please visit our website: https://saito.io

  `);

	function shutdownSaito() {
		console.log('Shutting down Saito');
		app.server.close();
		app.network.close();
	}

	/////////////////////
	// Cntl-C to Close //
	/////////////////////
	process.on('SIGTERM', function () {
		shutdownSaito();
		console.log('Network Shutdown');
		process.exit(0);
	});
	process.on('SIGINT', function () {
		shutdownSaito();
		console.log('Network Shutdown');
		process.exit(0);
	});
}

initSaito().catch((e) => console.error(e));
