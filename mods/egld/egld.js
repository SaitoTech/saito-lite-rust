const CryptoModule = require("../../lib/templates/cryptomodule");
const { ApiNetworkProvider, ProxyNetworkProvider, 
Account, UserSigner, Address, UserWallet, Transaction, 
TransactionComputer, UserSecretKey, Mnemonic  } = require("@multiversx/sdk-core");

class EGLDModule extends CryptoModule {
    constructor(app, mod) {
        super(app);
        this.app = app;
        this.ticker = "EGLD";
        this.name = "EGLD";
        this.categories = "Cryptocurrency";
        this.balance = 0;
        this.egld = {};
        this.base_url = null;
        this.network_provider_url = null;
        this.explorer_url = null;
        this.apiNetworkProvider = null;
        this.proxyNetworkProvider = null;
        this.networkConfig = null;
        this.account_created = 0;
        this.account = null;
        this.nonce = 0;
        this.address_obj = null;
        this.secretKey = null;
    }

  async initialize(app) {
        await super.initialize(app);
        await this.load();    
        this.app.connection.emit('header-update-balance');
  }

  async activate() {
    console.log("activating egld ///");

    if (this.account_created == 0){
        await this.getAddress();
        await this.setupNetwork();
        await this.generateAccount();
        this.save();
    }

    await super.activate();
  }

  async getAddress(mnemonic_text = null) {
      try {
        let mnemonic = null;
        if (mnemonic_text == null) {
            // Generate Ed25519 key pair
            mnemonic = Mnemonic.generate();            
        } else {
            mnemonic = Mnemonic.fromString(mnemonic_text);  
        }

        this.secretKey = mnemonic.deriveKey(0);
        const publicKey = this.secretKey.generatePublicKey();
        this.address_obj = publicKey.toAddress();

        this.egld.mnemonic_text = mnemonic.text;
        this.egld.address = this.address = this.destination = this.address_obj.toBech32();
      } catch (error) {
        console.error("Error creating EGLD address:", error);
        throw error;
      }
  }

  async generateAccount() {
      try {
        if (this.address_obj != null) {
            let account = new Account(this.address_obj);
            this.account = account;

            this.egld.balance = this.balance = this.account.balance;
            this.egld.nonce = this.nonce = this.account.nonce;

            if (this.account != null) {
                await this.showBackupWallet();
                this.account_created = 1;
                this.egld.isActivated = true;
            }

            //console.log("generateAccount account: ", this.account);
        }
      } catch (error) {
        console.error("Error creating EGLD account:", error);
        throw error;
      }
  }

  async updateAccount() {
    try {
        if (this.apiNetworkProvider == null) {
            return;
        }

        if (this.address_obj != null) {
            if (this.account == null) {
                this.account = new Account(this.address_obj);
            }
           // console.log("updateAccount this.address_obj:", this.address_obj);

            const accOnNetwork = await this.apiNetworkProvider.getAccount(this.address_obj);
            this.account.update(accOnNetwork);

            this.egld.bigIntBalance = BigInt(this.account.balance.toNumber())
            this.egld.balance = this.balance = this.convertAtomicToEgld(this.egld.bigIntBalance);
            this.egld.nonce = this.nonce = this.account.nonce;

            // console.log("updateAccount account: ", this.account);
            // console.log("updateAccount account balance bigint: ", this.balance);
            //console.log("updateAccount account balance: ", this.account.balance.toString());
        }
      } catch (error) {
        console.error("Error updating EGLD account:", error);
        throw error;
      }

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

    async returnBalance(){
        await this.updateAccount();
        return this.balance;
    }

    formatBalance(){
        const balanceStr = this.balance.toString();
        if (balanceStr.includes('e-')) {
            return '0.00';
        }
        return this.balance;
    }

    formatReadableNum(num){
        if (num % 1 === 0) {
            return num.toString(); // Return as is for integers
        }
        let numStr = num.toString();
        let decimalIndex = numStr.indexOf('.');
        if (decimalIndex !== -1) {
            let trailingZerosTrimmed = numStr.replace(/(\.\d*?)0+$/, '$1'); // Remove trailing zeros
            return trailingZerosTrimmed;
        }
        return numStr; // Return unchanged if no decimal part exists
    }

    returnAddress (){
        return this.address;
    }

    async getNonce(){
        await this.updateAccount();
        return this.nonce;
    }

    async returnHistory(callback = null) {
        const address = Address.newFromBech32(this.address);
        const transactions = await this.apiNetworkProvider.doGetGeneric(
            `accounts/${address.toBech32()}/transactions`
        );

        let balance = BigInt(this.account.balance); // Start with the latest balance
        console.log("return history: ", transactions);

        let html = '';
        if (transactions.length > 0) {
            transactions.sort((a, b) => b.timestamp - a.timestamp);

            for (let i = 0; i < transactions.length; i++) {
                const row = transactions[i];

                const created_at = new Date(row.timestamp * 1000).toLocaleString(); // Convert timestamp to readable date
                const amount = BigInt(row.value);
                const type = (row.sender.toLowerCase() === this.address.toLowerCase()) ? 'Withdraw' : 'Deposit';

                let fee = BigInt(row.fee);

                const displayed_balance = this.convertAtomicToEgld(balance);
                
                if (row.status == 'invalid') {
                    balance += fee; 
                } else if (type === 'Withdraw') {
                    balance += (amount+fee);
                } else {
                    balance -= amount;
                }

                const trans_hash = row.txHash;
                const sender_html = `
                    <a class="history-tx-link" href="${this.explorer_url}/transactions/${trans_hash}" target="_blank">
                        <div class="history-tx-id">${trans_hash}</div>
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>`;

                html += `<div class='saito-table-row'>
                    <div class='mixin-his-created-at'>${created_at}</div>
                    <div>${type} ${row.status == 'invalid' ? '(Invalid)' : ''}</div>
                    <div class='${type.toLowerCase()} ${row.status}'>
                        ${this.convertAtomicToEgld(amount)} EGLD
                        ${type == 'Withdraw' ? `(${this.convertAtomicToEgld(fee)} fee)` : ``}
                    </div>
                    <div>${displayed_balance} EGLD</div>
                    <div>${sender_html}</div>
                </div>`;
            }
        }

        return callback(html);
    }


    async sendPayment(amount = '', recipient = '', unique_hash = '') {

        console.log("inside sendPayment ////");
        console.log("amount, recipient, unique_hash: ", amount , recipient , unique_hash);

        console.log("this.egld: ", this.egld);

        if (this.address_obj == null) {
            await this.load();    
        }

        // update account to get latest nonce
        this.updateAccount();

        console.log("this.secretKey: ", this.secretKey);
        let txObj = {
            value: this.convertEgldToAtomic(amount),
            sender: this.address_obj,
            receiver: Address.newFromBech32(recipient),
            chainID: "D",
            nonce: this.egld.nonce,
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


    async receivePayment(
        amount = '',
        sender = '',
        recipient = '',
        timestamp = 0,
        unique_hash = ''
    ) {
        let this_self = this;
        let status = 0;
        try {
            console.log('amount, sender, timestamp, unique_hash:');
            console.log(amount, sender, timestamp, unique_hash);

            const address = Address.newFromBech32(this.address);
            const txs = await this.apiNetworkProvider.doGetGeneric(
                `accounts/${address.toBech32()}/transactions`
            );

            console.log("receivePayment transactions: ", txs);

            let tx = txs[0];
            //compare timestamps
            timestamp = Math.floor(timestamp/1000);
            console.log('received_datetime - snapshot_datetime - diff : ', 
                timestamp, tx.timestamp, (tx.timestamp - timestamp));

            if (tx.timestamp - timestamp > 0) {
                console.log('*************************************');               
                console.log("snapshot response ///");

                let senders = tx.senders;

                console.log('sender: ', sender);
                console.log('sender: ', tx.sender);
                console.log('sender == : ', (sender == tx.sender));

                // filter out opponents
                if (tx.sender == sender) {

                    console.log('opponent_id matched ////');
                    console.log("tx: ", tx);

                    let snapshot_amount = this.convertAtomicToEgld(tx.value);
                    console.log('amount: ', amount);
                    console.log('snapshot_amount: ', snapshot_amount);

                    if (snapshot_amount == amount){
                        
                        console.log("checking status ///")

                        // check tx status 
                        if (tx.status == 'success') {
                            console.log('match found ///');
                            return 1;
                        }
                        
                    }
                    
                }
        
            }

            console.log('receivePayment status: ', status);
            return status;
        
        } catch (error) {
            console.error("Error fetching transaction status:", error.message);
            return status;
        }
    }

    async getTransactionStatus(txHash) {
        try {
            const transactionDetails = await this.apiNetworkProvider.getTransaction(txHash);
            return transactionDetails;
        } catch (error) {
            console.error("Error fetching transaction status:", error.message);
            throw error;
        }
    }

    async returnWithdrawalFeeForAddress(address, callback) {
        let fee = BigInt(this.networkConfig.MinGasLimit * this.networkConfig.MinGasPrice);
        console.log("egld fee;", fee);
        return callback(this.convertAtomicToEgld(fee));
    }


    convertEgldToAtomic(amount = '0.0') {
        let bigIntNum = 0;
        let num = Number(amount);
        if (num > 0) {
            bigIntNum = num * 1000000000000000000; // 100,000,000
        }

        return (bigIntNum);
    }
     
    convertAtomicToEgld(amount = BigInt(0)) {
        let string = '0.00';
        let num = 0;
        let bigint_divider = 1000000000000000000n;

        num = Number((BigInt(amount) * 1000000000000000000n) / bigint_divider) / 1000000000000000000;

        num = num.toFixed(5);

        string = num.toString();
        return string;
    }

    async load(){
        if (this.app?.options?.crypto?.EGLD) {
          this.egld = this.app.options.crypto.EGLD;
          //console.log("EGLD OPTIONS: " + JSON.stringify(this.app.options.crypto.EGLD));
          if (this.egld.mnemonic_text) {
            this.is_initialized = 1;
            this.account_created = 1;
            this.options = this.egld;
            this.balance = this.egld.balance;
            this.address = this.egld.address;
            this.destination = this.egld.address;
            
            await this.getAddress(this.egld.mnemonic_text);
            //await this.updateAccount();
          }
        }
    }

    save() {
        if (!this.app.options?.crypto?.EGLD) {
            this.app.options.crypto = {};
            this.app.options.crypto.EGLD = {};
        }
        this.app.options.address = this.egld.address;
        this.app.options.destination = this.egld.destination; 
        this.app.options.balance = this.egld.balance; 
        this.app.options.crypto.EGLD = this.egld;
        this.app.storage.saveOptions();
    }

    getEnv(){
        console.log("getEnv ///");
        if (typeof process.env.EGLD != "undefined") {
          return JSON.parse(process.env.EGLD);
        } else {
            return {
                base_url: "https://devnet-api.multiversx.com",
                network_provider_url: "https://devnet-gateway.multiversx.com",
                explorer_url: "https://devnet-explorer.multiversx.com",
            }
        }
    }

    async setupNetwork(){
        let this_self = this;
        
        //console.log("this_self.egld.base_url:", this_self.egld.base_url);    
        if (this_self.egld.base_url == null) {
            await this_self.sendFetchEnvTransaction(async function (res){
                
                if (typeof res == 'object' && Object.keys(res).length > 0) {
                    this_self.base_url = this_self.egld.base_url = res.base_url;
                    this_self.explorer_url = this_self.egld.explorer_url = res.explorer_url;
                    this_self.network_provider_url = this_self.egld.network_provider_url = res.network_provider_url;

                    await this_self.initiateNetwork();
                } else {
                    console.error("Unable to load config from env");
                }
            });
        } else {
            await this_self.initiateNetwork();
        } 
    }

    async initiateNetwork() {
        // console.log("outside: ////");
        // console.log("base_url:", this.base_url);
        // console.log("base_url:", this.explorer_url);
        // console.log("base_url:", this.network_provider_url);

        this.apiNetworkProvider = new ApiNetworkProvider(this.base_url, { clientName: "multiversx-your-client-name" });
        this.proxyNetworkProvider = new ProxyNetworkProvider(this.network_provider_url, { clientName: "multiversx-your-client-name" });
        this.networkConfig = await this.apiNetworkProvider.getNetworkConfig();
    }

    async onPeerServiceUp(app, peer, service = {}) {
        //console.log("service:", service.service);
    }

    async handlePeerTransaction(app, tx = null, peer, mycallback) {
        if (tx == null) {
          return 0;
        }
        let message = tx.returnMessage();

        //
        // we receive requests to create accounts here
        //
        if (message.request === "egld fetch env") {
          await this.receiveFetchEnvTransaction(app, tx, peer, mycallback);
        }

        return super.handlePeerTransaction(app, tx, peer, mycallback);
      }

    async sendFetchEnvTransaction(callback = null){
        let this_self = this;
        let peers = await this.app.network.getPeers();
        // we cannot create an account if the network is down
        if (peers.length == 0) {
          console.warn("No peers");
          return;
        }
      
        let data = {
        };
        this_self.app.network.sendRequestAsTransaction(
          "egld fetch env",
          data,
          function (res) {
            console.log("Callback for sendCreateAccountTransaction request: ", res);
            if (typeof res == 'object' && Object.keys(res).length > 0) {
              //console.log("response from env", res);
            }

            if (callback) {
              return callback(res);
            }
          },
          peers[0].peerIndex
        );
      }

    async receiveFetchEnvTransaction(app, tx, peer, callback) {
        if (app.BROWSER == 0) {
          let m = this.getEnv();
          console.log("m: ", m);
          if (!m) {
            console.error("MIXIN ENV variable missing.");
            return;
          }

          return callback(m);
        }
    }
}

module.exports = EGLDModule;


