import React, { useEffect } from "react";

const Button = require('./Button').default;

const App = ({ app, mod }) => {

    const createMessageTransaction = async () => {
        let newtx =
            await app.wallet.createUnsignedTransactionWithDefaultFee();
        newtx.addTo(mod.publicKey)
        newtx.msg = {
            module: 'React',
            request: "message-request",
        };
        await newtx.sign();
        app.connection.emit('relay-transaction', newtx);
    }


    useEffect(() => {
        mod.handlePeerTransaction = function (blk, tx) {
            console.log("handle peer transacton", blk, tx)
        }
    }, [])



    return (
        <div>
            <h1>Hello from React !</h1>
            <Button app={app} onClick={() => createMessageTransaction()} text="click me" />
        </div>

    );

}

export default App