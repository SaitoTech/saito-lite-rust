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
const { ApiNetworkProvider, ProxyNetworkProvider, 
Account, UserSigner, Address, UserWallet, Transaction, 
TransactionComputer, UserSecretKey, Mnemonic  } = require("@multiversx/sdk-core");
const crypto = require('crypto');
const nacl = require('tweetnacl');


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
    this.secretKey = null;
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
        await this.getAddress();
        await this.generateAccount();

        //await this.showBackupWallet();
        this.account_created = 1;
        this.save();
    }

    await super.activate();
  }

  async getAddress(mnemonic_text = null) {
    console.log("EGLD getAddress");
      try {
        let mnemonic = null;
        if (mnemonic_text == null) {
            console.log("if case");
            // Generate Ed25519 key pair
            mnemonic = Mnemonic.generate();            
        } else {
            console.log("else case");
            mnemonic = Mnemonic.fromString(mnemonic_text);  
        }

        this.secretKey = mnemonic.deriveKey(0);
        const publicKey = this.secretKey.generatePublicKey();
        this.address_obj = publicKey.toAddress();

        console.log("mnemonic: ", mnemonic);
        console.log("this.secretKey: ", this.secretKey);
        console.log("publicKey: ", publicKey);
        console.log("this.address_obj: ", this.address_obj);

        this.egld.mnemonic_text = mnemonic.text;
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

        return (bigIntNum);
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

        console.log("this.egld: ", this.egld);

        if (this.address_obj == null) {
            await this.load();    
        }

        console.log("this.secretKey: ", this.secretKey);
        let txObj = {
            value: this.convertNumberToBigint(amount),
            sender: this.address_obj,
            receiver: Address.newFromBech32(recipient),
            chainID: "D",
            nonce: this.account.nonce,
            gasLimit: 50000,
            //data: "SAITO multiwallet transfer"
        };
        console.log("txObj: ", txObj);

        // get funds to you address before creating the transaction
        const transaction = new Transaction(txObj);

        // let gasLimit =   this.networkConfig.erd_min_gas_limit + 
        //                 this.networkConfig.erd_gas_per_data_byte * (Buffer.from(transaction.data, "hex").length);
        console.log("transaction before: ", transaction);

        // serialize transaction for signing
        const txComputer = new TransactionComputer();
        const serializedTX = txComputer.computeBytesForSigning(transaction);

        console.log("serializedTX: ", serializedTX);

        // set the signature
        transaction.signature = this.secretKey.sign(serializedTX);

        console.log("transaction after: ", transaction);

        // broadcast transaction
        const txHash = await this.apiNetworkProvider.sendTransaction(transaction);
        console.log("txHash: ", txHash);
        return txHash;
    }


    // async sendPayment(amount = '', recipient = '', unique_hash = '') {

    //     console.log("inside sendPayment ////");
    //     console.log("amount, recipient, unique_hash: ", amount , recipient , unique_hash);

    //     let txObj = {
    //       nonce: BigInt(0), // Set this value to match the expected nonce
    //       value: BigInt(50000000000000000), // Set this value to match the expected amount
    //       receiver: recipient, // Correct receiver
    //       sender: this.address, // Correct sender
    //       gasPrice: BigInt(1000000000),
    //       gasLimit: BigInt(50000),
    //       chainID: 'D', // Expected chainID
    //       version: 1, // Required version field
    //     }
    //     const transaction = new Transaction(txObj);

    //     // const secretKey = this.base64ToUint8Array(this.egld.secretKey);
    //     console.log("Decoded key (Uint8Array):", this.egld.secretKey);
    //     // console.log("Decoded key length:", secretKey.length);

    //     // // Ensure it's exactly 32 bytes
    //     // if (secretKey.length !== 32) {
    //     //   console.error("Decoded key must be 32 bytes long.");
    //     // }

    //     // console.log("obj:", txObj);
    //     // console.log("transaction: ", transaction);
    //     // console.log("secretKey: ", secretKey);

    //     // Convert JSON object to string and then to a buffer
    //     const message = new TextEncoder().encode(JSON.stringify(txObj));

    //     console.log("message: ", message);

    //     // const privateKeyUint8Array = Buffer.from(this.egld.secretKey, 'hex');
    //     // console.log("privateKeyUint8Array:", privateKeyUint8Array);
    //     const signature = nacl.sign.detached(message, this.egld.secretKey);

    //     if (signature.length !== 64) {
    //         console.error("Invalid signature length. Expected 64 bytes.");
    //     }

    //      console.log('Raw signature:', signature);
    //     console.log('Raw signature length:', signature.length);

    //   transaction.signature = Buffer.from(signature).toString('hex');
    //   console.log('Encoded signature:', transaction.signature);

    //     console.log("transaction after:", transaction);

    //     const txHash = await this.apiNetworkProvider.sendTransaction(transaction);
    //     console.log("TX hash:", txHash);
    // }


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

            await this.getAddress(this.egld.mnemonic_text);
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


    // Convert Uint8Array to Base64
    uint8ArrayToBase64(uint8Array) {
      return btoa(String.fromCharCode.apply(null, uint8Array));
    }

    // Decode Base64 back to Uint8Array
    base64ToUint8Array(base64) {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }


}

module.exports = EGLDModule;


