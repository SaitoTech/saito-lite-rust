import { Saito } from '../core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mods_config from '../../config/modules.config';
import build from '../../config/build.json';
import { initialize as initSaito } from 'saito-js/index.web';
import S from 'saito-js/saito';
import WebSharedMethods from 'saito-js/lib/custom/shared_methods.web';
import Transaction from '../../lib/saito/transaction';
import Factory from '../../lib/saito/factory';
import Wallet from '../../lib/saito/wallet';
import Blockchain from '../../lib/saito/blockchain';
import PeerServiceList from 'saito-js/lib/peer_service_list';
import { LogLevel } from 'saito-js/saito';





class WebMethods extends WebSharedMethods {
    app: Saito;

    constructor(app: Saito) {
        super();
        this.app = app;
    }

    async processApiCall(
        buffer: Uint8Array,
        msgIndex: number,
        peerIndex: bigint
    ): Promise<void> {
        const mycallback = async (response_object) => {
            try {
                await S.getInstance().sendApiSuccess(
                    msgIndex,
                    Buffer.from(JSON.stringify(response_object), 'utf-8'),
                    peerIndex
                );
            } catch (error) {
                console.error(error);
            }
        };
        let peer = await this.app.network.getPeer(peerIndex);
        let newtx = new Transaction();
        try {
            newtx.deserialize(buffer);
            newtx.unpackData();
            // console.debug("processing peer tx : ", newtx.msg);
        } catch (error) {
            console.error(error);
            newtx.msg = buffer;
        }
        await this.app.modules.handlePeerTransaction(newtx, peer, mycallback);
    }

    sendInterfaceEvent(event: string, peerIndex: bigint, public_key: string) {
        this.app.connection.emit(event, peerIndex, public_key);
    }

    sendBlockSuccess(hash: string, blockId: bigint) {
        this.app.connection.emit('add-block-success', { hash, blockId });
    }

    sendNewVersionAlert(
        major: number,
        minor: number,
        patch: number,
        peerIndex: bigint
    ): void {
        console.log(`emit : new-version-detected ${major}:${minor}:${patch}`);
        this.app.connection.emit('new-version-detected', {
            version: `${major}.${minor}.${patch}`,
            peerIndex: peerIndex
        });
    }

    sendWalletUpdate() {
        this.app.connection.emit('wallet-updated');
    }
    sendBlockFetchStatus(count){
        this.app.connection.emit('block-fetch-status', {count: count});
    }

    async saveWallet() {
        this.app.options.wallet.publicKey =
			await this.app.wallet.getPublicKey();
        this.app.options.wallet.privateKey =
			await this.app.wallet.getPrivateKey();
        this.app.options.wallet.balance = await this.app.wallet.getBalance();
    }

    async loadWallet() {
        throw new Error('Method not implemented.');
    }

    async saveBlockchain() {
        throw new Error('Method not implemented.');
    }

    async loadBlockchain() {
        throw new Error('Method not implemented.');
    }

    getMyServices() {
        let list = new PeerServiceList();
        let result = this.app.network.getServices();
        result.forEach((s) => list.push(s));
        return list;
    }

    ensureBlockDirExists(path: string): void { }
}

async function init() {

    console.log('lite init...');

    const saito = new Saito({ mod_paths: mods_config.lite });
    await saito.storage.initialize();

    saito.options.browser_mode = true;
    saito.options.spv_mode = true;
    saito.build_number = parseInt(build.build_number);
    console.info('Build Number: ' + saito.build_number);

    // saito.storage.convertOptionsBigInt(saito.options);

    console.log('saito options : ', saito.options);
    try {
        await initSaito(
            saito.options,
            new WebMethods(saito),
            new Factory(),
            saito.options.wallet?.privateKey || '',
            LogLevel.Info,
            BigInt(1),
            true,
        );
    } catch (e) {
        console.error(e);
    }

    // enable it for ATR testing
    // await S.getInstance().disableProducingBlocksByTimer();

    saito.wallet = (await S.getInstance().getWallet()) as Wallet;
    saito.wallet.app = saito;
    saito.blockchain = (await S.getInstance().getBlockchain()) as Blockchain;
    saito.blockchain.app = saito;
    saito.BROWSER = 1;
    saito.SPVMODE = 1;

    if (saito.options.blockchain.fork_id){
        await saito.blockchain.setForkId(saito.options.blockchain.fork_id);
    }

    try {
        await saito.init();
    } catch (e) {
        console.error(e);
    }

    S.getInstance().start();


}


window.onload = async function () {
    // console.log(args, "args")
    try {
        await init();
		
    } catch (error) {
        console.error(error);
    }
};
