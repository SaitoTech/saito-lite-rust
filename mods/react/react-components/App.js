/**
 * App Component for integrating React within the Saito.
 * 
 * This component demonstrates how React can be used with Saito to create dynamic,
 * real-time user interfaces that interact with the blockchain.
 * 
 * General functionality includes:
 * - Sending transactions and messages through the Saito network.
 * - Listening for and displaying blockchain events such as new blocks and transactions.
 * - Listening for new blocks and rendering them
 * 
 * This component highlights how React can be used to build interactive, blockchain-connected UIs within Saito's ecosystem.
 */


import React, { useState, useEffect } from "react";
const Button = require('./Button').default;

const App = ({ app, mod }) => {
    const [publicKey, setPublicKey] = useState("");
    const [message, setMessage] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [newBlock, setNewBlock] = useState(null);

    const createMessageTransaction = async (type) => {
        if (message.trim() === "") {
             // this is declared in app.browser inside the browser.ts file
            siteMessage("Message field is empty!", 2500)
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
          // this is declared in app.browser inside the browser.ts file
        siteMessage(`Message Sent via ${type} `, 2500)
        setMessage("");
    };



    useEffect(() => {
        mod.handlePeerTransaction = function (blk, tx) {
            if (tx.msg.request === "message-request" && tx.isTo(mod.publicKey) && !tx.isFrom(mod.publicKey)) {
                const newMessage = tx.msg.content;
                setReceivedMessages(prev => [...prev, newMessage]);
                // this is declared in app.browser inside the browser.ts file
                siteMessage("Received a new message", 2500);
            }
        };

        mod.onConfirmation = function (blk, tx) {
            console.log("Transaction confirmed:", tx);
        };

        mod.onNewBlock = function (blk) {
            console.log("new block:", blk);
            setNewBlock(blk);
              // this is declared in app.browser inside the browser.ts file
            siteMessage(`Received new block`, 2500)
        };
    }, []);



    const renderBlockInfo = (block) => {

        if (!block) return <p>No block data available</p>;
        const baseURL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

        return (
            <div className="block-container">
                <h4>New Block</h4><div></div>
                <p>
                    <strong>Block Hash:</strong>
                    <a
                        href={`${baseURL}/explorer/block?hash=${block.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {block.hash}
                    </a>
                </p>
                <p><strong>Previous Block Hash:</strong> <span>{block.previousBlockHash}</span></p>
                <p><strong>Block Type</strong> <span>{block.block_type}</span></p>
                <p><strong>Number of Transactions:</strong> <span>{block.transactions.length}</span></p>
                <ul>
                    {block.transactions.map((tx, index) => (
                        <li key={index}>
                            <p><strong>Transaction {index + 1}:</strong><span></span></p>
                            <p><strong>Hash:</strong> {tx.signature}<span></span></p>
                            <p><strong>Timestamp:</strong> {tx.timestamp}<span></span></p>
                            <p><strong>From:</strong> <span>{tx.from.map(slip => slip.publicKey).join(", ")}</span></p>
                            <p><strong>To:</strong> <span>{tx.to.map(slip => slip.publicKey).join(", ")}</span></p>
                            <p><strong>Content:</strong> <span>{tx.content}</span></p>
                            <p><strong>Module:</strong> <span>{tx.module}</span></p>
                            <p><strong>Request:</strong> <span>{tx.request}</span></p>
                        </li>
                    ))}
                </ul>


            </div>
        );
    };

    const toggleSaitoCss = () => {
        const saitoCssHref = '/saito/saito.css'; 
        const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
        let saitoCssLink = null;

        linkElements.forEach(link => {
            if (link.href.includes(saitoCssHref)) {
                saitoCssLink = link;
            }
        });

        if (saitoCssLink) {
            saitoCssLink.remove();
        } else {

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = saitoCssHref;
            document.head.appendChild(link);
        }
    };



    return (
        <div className="app-container">
            <div className="user-box">
                {/* keychain is declared in the keychain.ts file */}
                <div className="identicon"><img src={app.keychain.returnIdenticon(mod.publicKey)} /></div>
                <div className="public-key">{mod.publicKey || "No public "}</div>
            </div>


            <div className="message-send-container">
                <h4>Send a message</h4>
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

                <Button app={app} onClick={() => createMessageTransaction('relay')} text="Send via relay" />

                <Button app={app} onClick={() => createMessageTransaction('transaction')} text="Send transaction onchain" />
            </div>


            <div className="received-messages-container">
                <h4>Received Messages</h4>
                {receivedMessages.length > 0 ? (
                    receivedMessages.map((msg, index) => (
                        <p key={index}>{msg}</p>
                    ))
                ) : (
                    <p>No messages received yet</p>
                )}
            </div>

            {renderBlockInfo(newBlock)}

            <div style={{marginTop: '2.5rem'}}>
                
                <Button onClick={toggleSaitoCss} text="Toggle Saito Css"/>
            </div>
        </div>

    )
}

export default App;
