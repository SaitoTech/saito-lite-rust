/*********************************************************************************

   returnAddress()
   returnPrivateKey()
   async returnBalance(address = "")
   async sendPayment(amount="", recipient="", unique_hash="")
   async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="")


**********************************************************************************/
const { ApiNetworkProvider } = require("@elrondnetwork/erdjs-network-providers");
const CryptoModule = require('./../../../lib/templates/cryptomodule');
const axios  = require('axios')
const {account:Account, transaction: Transaction} = require('@elrondnetwork/elrond-core-js')


class EGLDModule extends CryptoModule {

  constructor(app,  mixin_mod) {

    super(app);
    this.app = app;
    this.ticker = "EGLD";
    this.name = "EGLD";
    this.categories = "Cryptocurrency";
    this.mixin = mixin_mod;
    this.balance = 0

    return this;

  }

  async installModule() {
    if (this.mixin) {
        if (this.mixin.egld_account_created == 0) {
        console.log("---------------------");
        console.log("creating on install: " + this.app.wallet.wallet.preferred_crypto);
        console.log("---------------------");
	     await this.mixin.createEGLDAccount();
        }   

      
    }
  }


  async sendPayment(amount, recipient){
    let nonce = 0;
    let from = this.mixin.egld.keyfile.bech32
   let  to = recipient
    let tx = new Transaction({
        nonce,
        from ,
        to ,
        senderUsername: "" ,
        receiverUsername: "" ,
        value : amount,
        gasPrice: 1000000000 ,
        gasLimit: 70000 ,
        data: "" ,
        chainID: "1",
        version: 1
    })

    try {
       let serializedTx = tx.prepareForSigning();
       tx.signature = this.mixin.egld.account.sign(serializedTx)
       console.log("signed tx", tx);
        let signedtx = tx.prepareForNode();
        let signedTxJson = JSON.stringify(signedtx, null, 4);
        console.log(signedTxJson)
      let res  = await  axios({
        method: 'post',
        url: 'https://gateway.elrond.com/transaction/send',
        data: signedtx
      })
    } catch (error) {
        console.log(error, "error")
    }


}

async returnBalance(address){
    let  res  = await  axios({
        method: 'get',
        url: `https://gateway.elrond.com/address/${address}/balance`,
        data: ""
      })

      return res.data.data.balance;

}

receivePayment(){

}

returnPrivateKey(){
    return this.mixin.egld.account.privateKey;
}

async updateBalance(balance){
    this.balance  = balance
}





}

module.exports = EGLDModule



