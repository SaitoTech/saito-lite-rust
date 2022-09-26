/*********************************************************************************

   returnAddress()
   returnPrivateKey()
   async returnBalance(address = "")
   async sendPayment(amount="", recipient="", unique_hash="")
   async receivePayment(amount="", sender="", recipient="", timestamp=0, unique_hash="")


**********************************************************************************/
const { ApiNetworkProvider } = require("@elrondnetwork/erdjs-network-providers");
let networkProvider = new ApiNetworkProvider("https://devnet-api.elrond.com");
const CryptoModule = require('./../../../lib/templates/cryptomodule');
const axios  = require('axios')
const {account:Account, transaction: Transaction} = require('@elrondnetwork/elrond-core-js')

const getUuid = require('uuid-by-string');

class EGLDModule extends CryptoModule {

  constructor(app,  mixin_mod) {

    super(app);
    this.app = app;
    this.ticker = "EGLD";
    this.name = "EGLD";
    this.categories = "Cryptocurrency";
    this.mixin = mixin_mod;
    this.balance = 0

    console.log("api network provider", ApiNetworkProvider)
    return this;

  }

  async installModule() {
    if (this.mixin) {
        if (this.mixin.egld_account_created == 0) {
        console.log("---------------------");
        console.log("creating on install: " + this.app.wallet.wallet.preferred_crypto);
        console.log("---------------------");
	     await this.mixin.createEGLDAccount();
         console.log(this.mixin.egld)
         this.sendPayment("50000000", "erd1wweaeya50vewmfepy3m6kp23hyeagpx4urqpan47ra5hst2e6qnsg0v00w");
         console.log('private key ', this.returnPrivateKey())
        }   

      
    }
  }

  activate() {
    if (this.mixin.account_created == 0) { 
      if (this.mixin.mixin.session_id === "") {
        this.mixin.createEGLDAccount();
      }
    }
    super.activate();
  }


  async sendPayment(amount, recipient){
    let networkConfig = await networkProvider.getNetworkConfig();
    let nonce = 0;
    let from = this.mixin.egld.keyfile.bech32
   let  to = recipient
  if(this.app.BROWSER === 1){
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

      console.log('result', res)

  
    } catch (error) {
        console.log(error, "error")
    }

}
}

async returnBalance(address){
    let  balance  = await  axios({
        method: 'get',
        url: `https://gateway.elrond.com/address/${address}/balance`,
        data: ""
      })

      return balance

}


returnPrivateKey(){
    return this.mixin.egld.account.privateKey;
}

async updateBalance(balance){
    this.balance  = balance
}





}

module.exports = EGLDModule



