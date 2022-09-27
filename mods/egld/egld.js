/*********************************************************************************

   returnAddress()
   returnPrivateKey()
   async returnBalance(address = "")
   async sendPayment(amount="", recipient="")
   async receivePayment(recipient)


**********************************************************************************/
const { ApiNetworkProvider } = require("@elrondnetwork/erdjs-network-providers");
const {TokenPayment} = require("@elrondnetwork/erdjs");
const axios  = require('axios')
const {account:Account, transaction: Transaction} = require('@elrondnetwork/elrond-core-js');
const CryptoModule = require("../../lib/templates/cryptomodule");


class EGLDModule extends CryptoModule {

  constructor(app, mod) {

    super(app);
    this.app = app;
    this.ticker = "EGLD";
    this.name = "EGLD";
    this.categories = "Cryptocurrency";
    this.balance = 0
    this.egld = {}

    app.connection.on('update-egld-balance', (address)=> {
            this.receivePayment(address);
    })

    return this;

  }


  initialize(){
        this.createEGLDAccount();
        this.init();
        console.log(this);
  }

//   async installModule() {
//     if (this.mixin) {
//         if (this.egld_account_created == 0) {
//         console.log("---------------------");
//         console.log("creating on install: " + this.app.wallet.wallet.preferred_crypto);
//         console.log("---------------------");
// 	     await this.createEGLDAccount();
//          if(this.app.BROWSER ===0){
//              await  this.init()
//             //  this.sendPayment("0.5", "erd1v580hy7cnntscsrqu407hlhuxr0rdm9c0tg5elt3wp4j4dd2kpmqnr969x" )
//             //  console.log('egld module ', this)
//          }
         
//         } 
//     }
//   }


  async init(){
    let address = this.egld.keyfile.bech32;
    this.networkProvider = new ApiNetworkProvider("https://devnet-api.elrond.com")
    await this.updateBalance(address);
    await this.updateAddressNonce(address);

  }


  async sendPayment(amount, recipient){
    let from = this.egld.keyfile.bech32
     let config = await this.networkProvider.getNetworkConfig()
     let nonce = await this.nonce
     nonce = this.incrementNonce(nonce)
    //  console.log('nonce ', nonce)
    let tokenPayment = TokenPayment.egldFromAmount(amount);
    let value = BigInt(amount * (10 ** tokenPayment.numDecimals));
    // console.log('value ', value.toString())
    const balance =  await this.returnBalance(from);
    if(parseFloat(balance) < parseFloat(value.toString())){
        return console.log("your balance is not enough for this transaction", balance);
    }
   let  to = recipient
    let tx = new Transaction({
        nonce,
        from,
        to,
        senderUsername: "" ,
        receiverUsername: "" ,
        value : value.toString(),
        gasPrice: 1000000000 ,
        gasLimit: 70000 ,
        data: "" ,
        chainID: config.ChainID,
        version: 1
    })

    try {
       let serializedTx = tx.prepareForSigning();
       tx.signature = this.egld.account.sign(serializedTx)
        let signedtx = tx.prepareForNode();
        signedtx.chainId = config.ChainID;
        let signedTxJson = JSON.stringify(signedtx, null, 4);;
        let res  = await  axios({
            method: 'post',
            url: 'https://devnet-api.elrond.com/transactions',
            data: signedtx
        })
        console.log('transaction successful')
    setTimeout(()=> {
     this.updateBalance(from)
    }, 3000)
    this.nonce = nonce
    this.sendUpdateRecipientBalanceTransaction(to)
    } catch (error) {
        console.log(error, "error");
    }
}

async returnBalance(address){
    let  res  = await  axios({
        method: 'get',
        url: `https://devnet-api.elrond.com/address/${address}/balance`,
        data: ""
      })
      this.balance = res.data.data.balance;
      return res.data.data.balance;
}



async getAddressNonce(address){
   const res = await axios({
    method: "get",
    url: `https://devnet-api.elrond.com/address/${address}/nonce`
   })
   let nonce = res.data.data.nonce;
//    console.log(res, 'data')
   return  nonce
}


async updateAddressNonce(address){
    const res = await axios({
        method: "get",
        url: `https://devnet-api.elrond.com/address/${address}/nonce`
       })

       this.nonce = res.data.data.nonce;
}


incrementNonce(nonce){
    return  nonce + 1
}



receivePayment(address){
        this.updateBalance(address)
}

returnPrivateKey(){
    return this.egld.account.privateKey;
}

async updateBalance(address){
    let balance = await this.returnBalance(address)
    balance = TokenPayment.egldFromBigInteger(balance)
    this.balance  = balance.toPrettyString()
    console.log('egld balance', this.balance)
}



async createEGLDAccount(){
    if(this.app.options.egld){
      let keyfile =  this.app.options.egld.keyfile
      let account = new Account(this.app.options.egld.keyfile, this.app.options.egld.password)
      this.egld.keyfile = keyfile;
      this.egld.account = account;
    }
    else {
      let password = this.app.crypto.generateRandomNumber().substring(0, 8);
      // let password = "password"
      let keyfile =  new Account().initNewAccountFromPassword(password)
      let account = new Account().loadFromKeyFile(keyfile, password)
      this.egld.keyfile = keyfile;
      this.egld.account = account;
      this.app.options.egld = {keyfile, password}
      this.app.storage.saveOptions(); 
    }
  

}

sendUpdateRecipientBalanceTransaction(recipient){
    //   let newtx = this.app.wallet.createUnsignedTransaction();
    //   newtx.transaction.to.push(recipient);
    //   newtx.msg.module = "Mixin";
    //   newtx.msg.request = "update-recipient-balance"
    //   newtx.msg.data = {
    //     recipient
    // };
    //   newtx = this.app.wallet.signTransaction(newtx);
    //   console.log(this.app.network);
    //   this.app.network.propagateTransaction(newtx);
  }
  
  receiveUpdateReciepientBalanceTransaction(blk, tx, conf, app){
          let egld_address = this.egld.keyfile.bech32;
          if (egld_address === tx.msg.data.recipient) {
              app.connection.emit('update-egld-balance', egld_address);
          }
  }



}

module.exports = EGLDModule



