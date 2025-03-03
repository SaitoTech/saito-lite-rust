const CryptoModule = require('../../lib/templates/cryptomodule');
const {
  ApiNetworkProvider,
  ProxyNetworkProvider,
  Account,
  UserSigner,
  Address,
  UserWallet,
  Transaction,
  TransactionComputer,
  UserSecretKey,
  Mnemonic
} = require('@multiversx/sdk-core');
const PeerService = require('saito-js/lib/peer_service').default;

class EGLDModule extends CryptoModule {
  constructor(app, ticker) {
    super(app);
    this.app = app;
    this.ticker = 'EGLD';
    this.name = 'EGLD';
    this.categories = 'Cryptocurrency';
    this.balance = 0;
    this.base_url = null;
    this.network_provider_url = null;
    this.explorer_url = null;
    this.apiNetworkProvider = null;
    this.proxyNetworkProvider = null;
    this.networkConfig = null;
    this.account = null;
    this.address_obj = null;
    this.secretKey = null;
  }

  async initialize(app) {
    try {
      await super.initialize(app);

      await this.getAddress();

      await this.setupNetwork();
      this.app.connection.emit('header-update-balance');
    } catch (error) {
      console.error('Error initialize:', error);
    }
  }

  async activate() {
    try {
      console.log('activating egld ///');
      await this.setupNetwork();

      if (!this.options?.mnemonic_text) {
        await this.getAddress();
        await this.generateAccount();
        this.save();
      }

      await super.activate();
    } catch (error) {
      console.error('Error activate:', error);
    }
  }

  // Don't over write with a new key!!!
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

      this.options.mnemonic_text = mnemonic.text;
      this.options.address = this.address = this.destination = this.address_obj.toBech32();
    } catch (error) {
      console.error('Error creating EGLD address:', error);
    }
  }

  async generateAccount() {
    try {
      if (this.address_obj != null) {
        let account = new Account(this.address_obj);
        this.account = account;

        this.options.balance = this.balance = this.account.balance;
        this.options.nonce = this.account.nonce;

        if (this.account != null) {
          await this.showBackupWalletMsg();
          this.options.isActivated = true;
        }

        //console.log("generateAccount account: ", this.account);
      }
    } catch (error) {
      console.error('Error creating EGLD account:', error);
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

        this.options.bigIntBalance = BigInt(this.account.balance.toNumber());
        this.options.balance = this.balance = this.convertAtomicToEgld(this.options.bigIntBalance);
        this.options.nonce = this.account.nonce;

        // console.log("updateAccount account: ", this.account);
        // console.log("updateAccount account balance bigint: ", this.balance);
        //console.log("updateAccount account balance: ", this.account.balance.toString());
      }
    } catch (error) {
      console.error('Error updating EGLD account:', error);
    }
  }

  async showBackupWalletMsg() {
    try {
      this.app.options.wallet.backup_required = 1;
      await this.app.wallet.saveWallet();

      let msg = `Your wallet has added new crypto keys. 
            Unless you backup your wallet, you may lose these keys. 
            Do you want help backing up your wallet?`;
      this.app.connection.emit('saito-backup-render-request', {
        msg: msg,
        title: 'BACKUP YOUR WALLET'
      });
    } catch (error) {
      console.error('Error backup wallet:', error);
    }
  }

  async returnBalance() {
    try {
      await this.updateAccount();
      return this.balance;
    } catch (error) {
      console.error('Error returning balance:', error);
    }
  }

  formatBalance() {
    try {
      const balanceStr = this.balance.toString();
      if (balanceStr.includes('e-')) {
        return '0.00';
      }
      return this.balance;
    } catch (error) {
      console.error('Error formatBalance:', error);
    }
  }

  formatReadableNum(num) {
    try {
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
    } catch (error) {
      console.error('Error formatReadableNum:', error);
    }
  }

  returnAddress() {
    try {
      return this.address;
    } catch (error) {
      console.error('Error returnAddress:', error);
    }
  }

  async getNonce() {
    try {
      await this.updateAccount();
      return this.options.nonce;
    } catch (error) {
      console.error('Error getNonce:', error);
    }
  }

  async returnHistory(callback = null) {
    try {
      const address = Address.newFromBech32(this.address);
      const transactions = await this.apiNetworkProvider.doGetGeneric(
        `accounts/${address.toBech32()}/transactions`
      );

      let balance = BigInt(this.account.balance); // Start with the latest balance
      console.log('return history: ', transactions);

      let html = '';
      if (transactions.length > 0) {
        transactions.sort((a, b) => b.timestamp - a.timestamp);

        for (let i = 0; i < transactions.length; i++) {
          const row = transactions[i];

          const created_at = new Date(row.timestamp * 1000).toLocaleString(); // Convert timestamp to readable date
          const amount = BigInt(row.value);
          const type =
            row.sender.toLowerCase() === this.address.toLowerCase() ? 'Withdraw' : 'Deposit';

          let fee = BigInt(row.fee);

          const displayed_balance = this.convertAtomicToEgld(balance);

          if (row.status == 'invalid') {
            balance += fee;
          } else if (type === 'Withdraw') {
            balance += amount + fee;
          } else {
            balance -= amount;
          }

          const trans_hash = row.txHash;
          const sender_html = `
                        <a class="history-tx-link" href="${this.options.explorer_url}/transactions/${trans_hash}" target="_blank">
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
    } catch (error) {
      console.error('Error returnHistory:', error);
    }
  }

  async sendPayment(amount = '', recipient = '', unique_hash = '', fee = null) {
    try {
      console.log('inside sendPayment ////');
      console.log('amount, recipient, unique_hash: ', amount, recipient, unique_hash);

      console.log('this.egld: ', this.options);

      if (this.address_obj == null) {
        this.load();
      }

      // update account to get latest nonce
      this.updateAccount();

      console.log('this.secretKey: ', this.secretKey);
      let txObj = {
        value: this.convertEgldToAtomic(amount),
        sender: this.address_obj,
        receiver: Address.newFromBech32(recipient),
        chainID: '1',
        nonce: this.options.nonce,
        gasLimit: 50000
        //data: "SAITO multiwallet transfer"
      };
      console.log('txObj: ', txObj);

      // get funds to you address before creating the transaction
      const transaction = new Transaction(txObj);

      // let gasLimit =   this.networkConfig.erd_min_gas_limit +
      //                 this.networkConfig.erd_gas_per_data_byte * (Buffer.from(transaction.data, "hex").length);
      console.log('transaction before: ', transaction);

      // serialize transaction for signing
      const txComputer = new TransactionComputer();
      const serializedTX = txComputer.computeBytesForSigning(transaction);

      console.log('serializedTX: ', serializedTX);

      // set the signature
      transaction.signature = this.secretKey.sign(serializedTX);

      console.log('transaction after: ', transaction);

      // broadcast transaction
      const txHash = await this.apiNetworkProvider.sendTransaction(transaction);
      console.log('txHash: ', txHash);

      return txHash;
    } catch (error) {
      console.error('Error sendPayment:', error);
    }
  }

  async receivePayment(amount = '', sender = '', recipient = '', timestamp = 0, unique_hash = '') {
    let this_self = this;
    let status = 0;
    try {
      console.log('amount, sender, timestamp, unique_hash:');
      console.log(amount, sender, timestamp, unique_hash);

      const address = Address.newFromBech32(this.address);
      const txs = await this.apiNetworkProvider.doGetGeneric(
        `accounts/${address.toBech32()}/transactions`
      );

      console.log('receivePayment transactions: ', txs);

      let tx = txs[0];
      //compare timestamps
      timestamp = Math.floor(timestamp / 1000);
      console.log(
        'received_datetime - snapshot_datetime - diff : ',
        timestamp,
        tx.timestamp,
        tx.timestamp - timestamp
      );

      if (tx.timestamp - timestamp > 0) {
        console.log('*************************************');
        console.log('snapshot response ///');

        let senders = tx.senders;

        console.log('sender: ', sender);
        console.log('sender: ', tx.sender);
        console.log('sender == : ', sender == tx.sender);

        // filter out opponents
        if (tx.sender == sender) {
          console.log('opponent_id matched ////');
          console.log('tx: ', tx);

          let snapshot_amount = this.convertAtomicToEgld(tx.value);
          console.log('amount: ', amount);
          console.log('snapshot_amount: ', snapshot_amount);

          if (Number(snapshot_amount) == Number(amount)) {
            console.log('checking status ///');

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
      console.error('Error fetching transaction status:', error.message);
      return status;
    }
  }

  async getTransactionStatus(txHash) {
    try {
      const transactionDetails = await this.apiNetworkProvider.getTransaction(txHash);
      return transactionDetails;
    } catch (error) {
      console.error('Error fetching transaction status:', error.message);
    }
  }

  async returnWithdrawalFeeForAddress(address, callback) {
    try {
      let fee = BigInt(this.networkConfig.MinGasLimit * this.networkConfig.MinGasPrice);
      console.log('egld fee;', fee);
      return callback(this.convertAtomicToEgld(fee));
    } catch (error) {
      console.error('Error returnWithdrawalFeeForAddress:', error);
    }
  }

  convertEgldToAtomic(amount = '0.0') {
    try {
      let bigIntNum = 0;
      let num = Number(amount);
      if (num > 0) {
        bigIntNum = num * 1000000000000000000; // 100,000,000
      }

      return bigIntNum;
    } catch (error) {
      console.error('Error convertEgldToAtomic:', error);
    }
  }

  convertAtomicToEgld(amount = BigInt(0)) {
    try {
      let string = '0.00';
      let num = 0;
      let bigint_divider = 1000000000000000000n;

      num = Number((BigInt(amount) * 1000000000000000000n) / bigint_divider) / 1000000000000000000;

      num = num.toFixed(5);

      string = num.toString();
      return string;
    } catch (error) {
      console.error('Error convertAtomicToEgld:', error);
    }
  }

  getEnv() {
    try {
      if (typeof process.env.EGLD != 'undefined') {
        return JSON.parse(process.env.EGLD);
      } else {
        console.error('Env variable not found');
        return {};
      }
    } catch (error) {
      console.error('Error env:', error);
    }
  }

  async setupNetwork() {
    try {
      let this_self = this;

      if (this_self.options.base_url == null) {
        await this_self.sendFetchEnvTransaction(async function (res) {
          if (typeof res == 'object' && Object.keys(res).length > 0) {
            this_self.base_url = this_self.options.base_url = res.base_url;
            this_self.explorer_url = this_self.options.explorer_url = res.explorer_url;
            this_self.network_provider_url = this_self.options.network_provider_url =
              res.network_provider_url;

            await this_self.initiateNetwork();
          } else {
            //console.error("Unable to load config from env");
          }
        });
      } else {
        await this_self.initiateNetwork();
      }
    } catch (err) {
      console.log(err);
    }
  }

  async initiateNetwork() {
    try {
      if (this.apiNetworkProvider == null) {
        // console.log("initiateNetwork: ////");
        // console.log("base_url:", this.options.base_url);
        // console.log("base_url:", this.options.explorer_url);
        // console.log("base_url:", this.options.network_provider_url);

        this.apiNetworkProvider = new ApiNetworkProvider(this.options.base_url, {
          clientName: 'multiversx-your-client-name'
        });
        this.proxyNetworkProvider = new ProxyNetworkProvider(this.options.network_provider_url, {
          clientName: 'multiversx-your-client-name'
        });
        this.networkConfig = await this.apiNetworkProvider.getNetworkConfig();
      }
    } catch (err) {
      console.log(err);
    }
  }

  returnServices() {
    try {
      let services = [];
      if (this.app.BROWSER == 0) {
        services.push(new PeerService(null, 'egld'));
      }
      return services;
    } catch (error) {
      console.error('Error returnServices:', error);
    }
  }

  async onPeerServiceUp(app, peer, service = {}) {
    try {
      if (!app.BROWSER) {
        return;
      }

      if (service.service == 'egld') {
        await this.setupNetwork();
      }
    } catch (error) {
      console.error('Error onPeerServiceUp:', error);
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    try {
      if (tx == null) {
        return 0;
      }
      let message = tx.returnMessage();

      //
      // we receive requests to create accounts here
      //
      if (message.request === 'egld fetch env') {
        await this.receiveFetchEnvTransaction(app, tx, peer, mycallback);
      }

      return super.handlePeerTransaction(app, tx, peer, mycallback);
    } catch (error) {
      console.error('Error handlePeerTransaction:', error);
    }
  }

  async sendFetchEnvTransaction(callback = null) {
    try {
      let this_self = this;
      let peers = await this.app.network.getPeers();
      // we cannot create an account if the network is down
      if (peers.length == 0) {
        console.warn('No peers');
        return;
      }

      let data = {};
      this_self.app.network.sendRequestAsTransaction(
        'egld fetch env',
        data,
        function (res) {
          // console.log("Callback for sendCreateAccountTransaction request: ", res);
          if (typeof res == 'object' && Object.keys(res).length > 0) {
            //console.log("response from env", res);
          }

          if (callback) {
            return callback(res);
          }
        },
        peers[0].peerIndex
      );
    } catch (error) {
      console.error('Error sendFetchEnvTransaction:', error);
    }
  }

  async receiveFetchEnvTransaction(app, tx, peer, callback) {
    try {
      if (app.BROWSER == 0) {
        let m = this.getEnv();
        //console.log("m: ", m);
        if (!m) {
          console.error('MIXIN ENV variable missing.');
          return;
        }

        return callback(m);
      }
    } catch (error) {
      console.error('Error receiveFetchEnvTransaction:', error);
    }
  }

  respondTo(type = '', obj) {
    try {
      if (type == 'crypto-logo') {
        if (obj?.ticker == this.ticker) {
          return {
            svg: `<?xml version="1.0" encoding="utf-8"?>
                            <!-- Generator: Adobe Illustrator 27.0.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                 viewBox="0 0 192 148" style="enable-background:new 0 0 192 148;" xml:space="preserve">
                            <style type="text/css">
                                .st0{fill:#23F7DD;}
                            </style>
                            <path class="st0" d="M106.4,74L192,28L177.6,0.2L99.2,32.1c-2,0.8-4.3,0.8-6.3,0L14.5,0.2L0.1,28l85.6,46l-85.6,46l14.4,27.8
                                l78.4-31.9c2-0.8,4.3-0.8,6.3,0l78.4,31.9l14.4-27.8L106.4,74z"/>
                            </svg>
                        `
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error respondTo:', error);
    }
  }
}

module.exports = EGLDModule;
