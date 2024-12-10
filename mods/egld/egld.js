/*********************************************************************************

   returnAddress()
   returnPrivateKey()
   async returnBalance(address = "")
   async sendPayment(amount="", recipient="", unique_hash="")
   async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="")

**********************************************************************************/
//const { ApiNetworkProvider } = require("@elrondnetwork/erdjs-network-providers");
//const {TokenPayment} = require("@elrondnetwork/erdjs");
const axios  = require('axios')
//const {transaction: Transaction} = require('@elrondnetwork/elrond-core-js');
const CryptoModule = require("../../lib/templates/cryptomodule");
const { ApiNetworkProvider, ProxyNetworkProvider, Account, UserSigner, Address, UserWallet, Transaction, TransactionComputer, UserSecretKey  } = require("@multiversx/sdk-core");

class EGLDModule extends CryptoModule {

  constructor(app, mod) {

    super(app);
    this.app = app;
    this.ticker = "EGLD";
    this.name = "EGLD";
    this.categories = "Cryptocurrency";
    this.balance = 0
    this.egld = {}
    this.base_url = "https://elrond-api-devnet.public.blastapi.io"
    // this.base_url = "https://elrond.saito.io/0"
    this.api_network_provider = "https://devnet-api.elrond.com"
    this.has_loaded = false
    this.apiNetworkProvider = null;
    this.proxyNetworkProvider = null;
    this.networkConfig = null;
    this.account_created = 0;
    this.account = null;
    this.nonce = 0;
    this.address_obj = null;
}

  async initialize(){
        await this.load();
        this.apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com", { clientName: "multiversx-your-client-name" });
        this.proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com", { clientName: "multiversx-your-client-name" });
        this.networkConfig = await this.apiNetworkProvider.getNetworkConfig();
        console.log(this.networkConfig.MinGasPrice);
        console.log(this.networkConfig.ChainID);
  }

  async activate() {
    console.log("activating egld ///");

    if (this.account_created == 0){
        await this.generateAddress();
        await this.generateAccount();

        await this.showBackupWallet();
        this.account_created = 1;
        this.save();
    }

    await super.activate();
  }

  async generateAddress(address = null) {
    console.log("EGLD generateAddress");
      try {
        if (address == null) {
            this.egld.privKey = this.app.crypto.generateKeys();
            this.address_obj = new Address(this.egld.privKey);
            
        } else {
            this.address_obj = new Address(address);
        }

        console.log("this.address_obj: ", this.address_obj);
    
        this.egld.address = this.address = this.destination = this.address_obj.toBech32();
      } catch (error) {
        console.error("Error creating EGLD address:", error);
        throw error;
      }
  }

  async generateAccount() {
    console.log("EGLD generateAccount");
      try {
        if (this.address_obj != null) {
            let account = new Account(this.address_obj);
            this.account = account;

            this.egld.balance = this.balance = this.account.balance;
            this.egld.nonce = this.nonce = this.account.nonce;

            console.log("generateAccount account: ", this.account);
        }
      } catch (error) {
        console.error("Error creating EGLD account:", error);
        throw error;
      }
  }

  async updateAccount() {
    console.log("EGLD updateAccount");
    try {
        if (this.address_obj != null) {
            if (this.account == null) {
                this.account = new Account(this.address_obj);
            }
            console.log("updateAccount this.address_obj:", this.address_obj);


            console.log("privKey: ", this.egld.privKey);
            let userSecKey = UserSecretKey.fromString(this.egld.privKey);
            console.log("this.userSecKey: ", userSecKey);
            const signer = new UserSigner(userSecKey);
            console.log("this.signer: ", signer);


            const accOnNetwork = await this.apiNetworkProvider.getAccount(this.address_obj);
            this.account.update(accOnNetwork);

            this.egld.bigIntBalance = BigInt(this.account.balance.toNumber())
            this.egld.balance = this.balance = this.convertBigIntToNumber(this.egld.bigIntBalance);
            this.egld.nonce = this.nonce = this.account.nonce;

            console.log("updateAccount account: ", this.account);
            console.log("updateAccount account balance bigint: ", this.balance);
            //console.log("updateAccount account balance: ", this.account.balance.toString());
        }
      } catch (error) {
        console.error("Error updating EGLD account:", error);
        throw error;
      }

  }


   convertNumberToBigint(amount = '0.0') {
        let bigIntNum = 0;
        let num = Number(amount);
        if (num > 0) {
            bigIntNum = num * 1000000000000000000; // 100,000,000
        }

        return BigInt(bigIntNum);
    }
     
    convertBigIntToNumber(amount = BigInt(0)) {
        let string = '0.00';
        let num = 0;
        let bigint_divider = 1000000000000000000n;

        if (typeof amount == 'bigint') {
            // convert bigint to number
            num = Number((amount * 1000000000000000000n) / bigint_divider) / 1000000000000000000;

            // convert number to string
            string = num.toString();
        } else {
            console.error(
                `convertNolanToSaito: Type ` +
                    typeof amount +
                    ` provided. BigInt required`
            );
        }

        return string;
    }


    async showBackupWallet(){
        this.app.options.wallet.backup_required = 1;
        await this.app.wallet.saveWallet();
        
        let msg = `Your wallet has added new crypto keys. 
        Unless you backup your wallet, you may lose these keys. 
        Do you want help backing up your wallet?`;
        this.app.connection.emit(
            'saito-backup-render-request',
            {msg: msg, title: 'BACKUP YOUR WALLET'}
        );
    }

    async sendPayment(amount = '', recipient = '', unique_hash = '') {

        console.log("inside sendPayment ////");
        console.log("amount, recipient, unique_hash: ", amount , recipient , unique_hash);
        let txObj = {
            nonce: this.account.nonce,
            sender: new Address(this.address),
            receiver: new Address(recipient),
            value: this.convertNumberToBigint('0.05'),//50000000000000000n, // 0.05egld
            //gasLimit: this.convertNumberToBigint('0.00000000000005'),//50000n,
            chainID: "D"
        };
        const transaction = new Transaction(txObj);

        console.log("obj:", txObj);
        console.log("transaction: ", transaction);

         console.log("privKey: ", this.egld.privKey);
        let userSecKey = UserSecretKey.fromString(this.egld.privKey);
        console.log("this.userSecKey: ", userSecKey);
        const signer = new UserSigner(userSecKey);
        console.log("this.signer: ", signer);


        const transactionComputer = new TransactionComputer()
        let serializedTransaction = transactionComputer.computeBytesForSigning(transaction);
        transaction.signature = await signer.sign(serializedTransaction);

        console.log("Signature", Buffer.from(transaction.signature).toString("hex"));
        const txHash = await this.apiNetworkProvider.sendTransaction(transaction);
        console.log("TX hash:", txHash);
    }


    async returnBalance(){
        console.log("EGLD returnBalance ///");
        await this.updateAccount();
        return this.balance;
    }

    returnAddress (){
        return this.address;
    }



    async getNonce(){
        await this.updateAccount();
        return this.nonce;
    }


    async updateNonce(){
    }


    incrementNonce(){
        
    }

    returnPrivateKey(){

    }

    async updateBalance(){

    }

    async load(){
        if (this.app?.options?.crypto?.egld) {
          this.egld = this.app.options.crypto.egld;
          console.log("EGLD OPTIONS: " + JSON.stringify(this.app.options.crypto.egld));
          if (this.egld.address) {
            this.destination = this.egld.address;
            await this.generateAddress(this.egld.address);
            //await this.updateAccount();
            this.account_created = 1;
          }
        }
    }

    save() {
        if (!this.app.options?.crypto?.egld) {
            this.app.options.crypto = {};
            this.app.options.crypto.egld = {};
        }
        this.app.options.crypto.egld = this.egld;
        this.app.storage.saveOptions();
        super.save();
    }


}

module.exports = EGLDModule;


