self.addEventListener( 'message', ({wallet, newtx})=> {
    console.log(wallet)
    let tx = JSON.parse(newtx)
    console.time('sign trnsaction')
    tx =  wallet.signTransaction(tx);
    console.timeEnd('sign trnsaction')
    // console.time('propagating trnsaction')
    //  network.propagateTransaction(tx);
    //  console.timeEnd ('propagating trnsaction')
})