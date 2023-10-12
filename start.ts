import Server, { NodeSharedMethods } from "./lib/saito/core/server";
import StorageCore from "./lib/saito/core/storage-core";
import { Saito } from "./apps/core";
import S, { initialize as initS } from "saito-js/index.node";
import mods_config from "./config/modules.config";
import process from "process";
import Factory from "./lib/saito/factory";
import Wallet from "./lib/saito/wallet";
import Blockchain from "./lib/saito/blockchain";
import { LogLevel } from "saito-js/saito";

// import Config from "saito-js/lib/config";

async function initSaito() {
  const app = new Saito({
    mod_paths: mods_config.core,
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  app.storage = new StorageCore(app);

  app.BROWSER = 0;
  app.SPVMODE = 0;

  // set basedir
  global.__webdir = __dirname + "/lib/saito/web/";

  await app.storage.initialize();

  let privateKey = app.options.wallet?.privateKey || "";
  await initS(
    app.options,
    new NodeSharedMethods(app),
    new Factory(),
    privateKey,
    LogLevel.Info
  ).then(() => {
    console.log("saito wasm lib initialized");
  });

  app.wallet = (await S.getInstance().getWallet()) as Wallet;
  app.wallet.app = app;
  app.blockchain = (await S.getInstance().getBlockchain()) as Blockchain;
  app.blockchain.app = app;
  app.server = new Server(app);

  await app.init();

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
    console.log("Shutting down Saito");
    app.server.close();
    app.network.close();
  }

  /////////////////////
  // Cntl-C to Close //
  /////////////////////
  process.on("SIGTERM", function () {
    shutdownSaito();
    console.log("Network Shutdown");
    process.exit(0);
  });
  process.on("SIGINT", function () {
    shutdownSaito();
    console.log("Network Shutdown");
    process.exit(0);
  });
}

initSaito().catch((e) => console.error(e));
