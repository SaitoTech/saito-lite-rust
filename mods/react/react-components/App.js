import React, { useState, useEffect } from "react";
const Button = require('./Button').default;

const App = ({ app, mod }) => {
    const [publicKey, setPublicKey] = useState("");
    const [message, setMessage] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [newBlock, setNewBlock] = useState(null); 

    const createMessageTransaction = async (type) => {

        if (message.trim() === "") {
            siteMessage("Message field is empty!")
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

        if (type === "relay") {
            app.connection.emit('relay-transaction', newtx);
        }
        else if (type === "transaction") {
            app.network.propagateTransaction(newtx);
        } else {
            app.connection.emit('relay-transaction', newtx);
            app.network.propagateTransaction(newtx);
        }

        console.log(type)

        
        siteMessage(`Message Sent via ${type} `)
        setMessage("");
    };

    useEffect(() => {
        mod.handlePeerTransaction = function (blk, tx) {
            if (tx.msg.request === "message-request" && tx.isTo(mod.publicKey) && !tx.isFrom(mod.publicKey)) {
                const newMessage = tx.msg.content;
                setReceivedMessages(prev => [...prev, newMessage]);
                siteMessage("Received a new message");
            }
        };

        mod.onConfirmation = function (blk, tx) {
            console.log("Transaction confirmed:", tx);
        };

        mod.onNewBlock = function (blk) {
            console.log("new block:", blk);
            setNewBlock(blk);
            siteMessage(`Received new block`)
        };
    }, []);

    const renderBlockInfo = (block) => {
        if (!block) return <p>No block data available</p>;

        return (
            <div className="block-container">
                <h3>New Block</h3>
                <p><strong>Block Hash:</strong> {block.hash}</p>
                <p><strong>Previous Block Hash:</strong> {block.previousBlockHash}</p>
                <p><strong>Block Type</strong> {block.block_type}</p>
                <p><strong>Number of Transactions:</strong> {block.transactions.length}</p>
                <ul>
                    {block.transactions.map((tx, index) => (
                        <li key={index}>
                            <p><strong>Transaction {index + 1}:</strong></p>
                            <p><strong>Hash:</strong> {tx.signature}</p>
                            <p><strong>Timestamp:</strong> {tx.timestamp}</p>
                            <p><strong>From:</strong> {tx.from.map(slip => slip.publicKey).join(", ")}</p>
                            <p><strong>To:</strong> {tx.to.map(slip => slip.publicKey).join(", ")}</p>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="app-container">
            <div className="user-box">
                <div className="identicon"><img src={app.keychain.returnIdenticon(mod.publicKey)} /></div>
                <div className="public-key">{mod.publicKey || "No public "}</div>
            </div>


            <div className="message-send-container">
                <h3>Send a message</h3>
                <input
                    type="text"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="Recipient's Public Key"
                />

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message"
                />

                <Button  app={app} onClick={() => createMessageTransaction('relay')} text="Send via relay" />

                <Button app={app} onClick={() => createMessageTransaction('transaction')} text="Send via transaction" />
            </div>


            <div className="received-messages-container">
                <h3>Received Messages</h3>
                {receivedMessages.length > 0 ? (
                    receivedMessages.map((msg, index) => (
                        <p key={index}>{msg}</p>
                    ))
                ) : (
                    <p>No messages received yet</p>
                )}
            </div>

            {renderBlockInfo(newBlock)}
        </div>

    )
}

export default App;
