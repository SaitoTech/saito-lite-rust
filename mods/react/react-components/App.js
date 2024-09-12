import React, { useState, useEffect } from "react";
const Button = require('./Button').default;

const App = ({ app, mod }) => {
    const [publicKey, setPublicKey] = useState("");
    const [message, setMessage] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);

    const createMessageTransaction = async () => {
        if (message.trim() === "") {
            return; 
        }
        let newtx = await app.wallet.createUnsignedTransactionWithDefaultFee();
        newtx.addTo(publicKey);
        newtx.msg = {
            module: 'React',
            request: "message-request",
            content: message,  
        };
        await newtx.sign();
        app.connection.emit('relay-transaction', newtx);
        siteMessage("Message sent")
        setMessage("");
    };

    useEffect(() => {
        mod.handlePeerTransaction = function (blk, tx) {
            if(tx.msg.request === "message-request" && tx.isTo(mod.publicKey) && !tx.isFrom(mod.publicKey)){
                const newMessage = tx.msg.content;
                setReceivedMessages(prev => [...prev, newMessage]);  
                siteMessage("Message received")
            }
         
        };
    }, []);

    return (
        <div>
            <h1>Message Test</h1>

            <input 
                type="text" 
                value={publicKey} 
                onChange={(e) => setPublicKey(e.target.value)} 
                placeholder="Recipient's Public Key" 
                style={{ marginBottom: '10px', display: 'block' }}
            />


            <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Type your message" 
                style={{ marginBottom: '10px', display: 'block' }}
            />

            <Button app={app} onClick={createMessageTransaction} text="Send" />

            <div style={{ marginTop: '20px', border: '1px solid black', padding: '10px', maxHeight: '200px', overflowY: 'scroll' }}>
                <h3>Received Messages:</h3>
                {receivedMessages.length > 0 ? (
                    receivedMessages.map((msg, index) => (
                        <p key={index}>{msg}</p>
                    ))
                ) : (
                    <p>No messages received yet</p>
                )}
            </div>
        </div>
    )
}

export default App;
