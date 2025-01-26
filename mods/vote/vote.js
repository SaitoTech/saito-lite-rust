const ModTemplate = require("../../lib/templates/modtemplate");
// const circomlibjs = require("circomlibjs");
const snarkjs = require('snarkjs')
const fs = require('fs');
const pageHome = require('./index');
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const { default: VoteLayout } = require("./lib/Vote-layout");


class Vote extends ModTemplate {
    constructor(app) {
        super(app);
        this.app = app;
        this.name = 'Vote';
        this.slug = 'vote';
        this.elections = new Map(); // Store elections
        this.votes = new Map();     // Store vote commitments
        this.nullifiers = new Set(); // Prevent double voting
        this.styles = ['/saito/saito.css', '/vote/style.css'];

        // Load verification key
        this.vkey = require('./zk/output/verification_key.json');
        this.wasmFile = './zk/build/election_js/election.wasm',
            this.zkeyFile = './zk/output/election_final.zkey'

    }

    onPeerServiceUp(app, peer, service = {}) {
        if (service.service === 'archive') {
            this.loadVoteLayout()
        }

    }

    async handlePeerTransaction(app, tx = null, peer, mycallback) {
        if (!tx) return 0;

        const message = tx.returnMessage();

        switch (message.request) {
            case "verify vote proof":
                await this.receiveVerifyProofTransaction(app, tx, peer, mycallback);
                break;

            case "create election":
                await this.receiveCreateElectionTransaction(app, tx, peer, mycallback);
                break;

            case "submit vote":
                await this.receiveSubmitVoteTransaction(app, tx, peer, mycallback);
                break;

            case "finalize election":
                await this.receiveFinalizeElectionTransaction(app, tx, peer, mycallback);
                break;

            default:
                return super.handlePeerTransaction(app, tx, peer, mycallback);
        }
    }


    async onConfirmation(blk, tx, conf) {
        let txmsg = tx.returnMessage();
        if (conf == 0) {
            if (txmsg.request === 'create election') {
                console.log("Vote onConfirmation");
                await this.receiveCreateElectionTransaction(tx);

            }
          
        }
    }



    async saveElectionTransaction(tx, from) {
        try {
            let peers = await this.app.network.getPeers();
            let peer = peers[0];

            if (!peer) return;

            await this.app.storage.saveTransaction(tx, {
                field1: 'Vote',
                field2: tx.msg.data.electionId
            }, "localhost");

            return true;
        } catch (error) {
            console.error("Error saving vote transaction:", error);
            throw error;
        }
    }


    async fetchElections(callback) {
        try {
            let peers = await this.app.network.getPeers();
            let peer = peers[0];
            let self = this

            await this.app.storage.loadTransactions(
                { field1: 'Vote' },
                (txs) => {
                    const elections = new Map();
                    txs.forEach(tx => {
                        console.log(tx, 'transaction')
                        const msg = tx.returnMessage();
                        if (msg.request === "create election") {
                            const data = msg.data;
                            elections.set(data.electionId, {
                                signature: tx.signature,
                                id: data.electionId,
                                numCandidates: data.numCandidates,
                                candidateNames: data.candidateNames,
                                description: data.description,
                                startDate: data.startDate,
                                endDate: data.endDate,
                                status: data.status || "active",
                                votes: data.votes || null,
                                created: tx.updated_at,
                                publicKey: tx.from[0].publicKey,
                                finalTally: data.finalTally || []

                            });
                        }
                    });

                    self.elections = elections;
                    console.log(this.elections);
                    if (callback) callback(Array.from(elections.values()));
                },
               peer
            );
        } catch (error) {
            console.error("Error fetching elections:", error);
            if (callback) callback([]);
        }
    }




    async fetchCurrentElectionId() {
        try {
            let peers = await this.app.network.getPeers();
            let peer = peers[0];

            return new Promise(async (resolve, reject) => {
                await this.app.storage.loadTransactions(
                    { field1: 'Vote' },
                    (txs) => {
                        console.log(txs, 'election transactions')
                        const electionTxs = txs.filter(tx =>
                            tx.returnMessage().request === "create election"
                        );
                        if (electionTxs.length > 0) {

                            this.currentElectionId = Math.max(
                                ...electionTxs.map(tx =>
                                    parseInt(tx.returnMessage().data.electionId) || 0
                                )
                            );
                            resolve(this.currentElectionId + 1);
                        } else {
                            resolve(1);
                        }

                    },
                    peer
                );
            });
        } catch (error) {
            console.error("Error fetching current election ID:", error);
            // Fallback to incrementing current ID if exists, or start at 1
            this.currentElectionId = (this.currentElectionId || 0) + 1;
            return this.currentElectionId;
        }
    }


    // Generate proof for a vote
    async generateVoteProof(electionId, candidateIndex, nonce) {
        const election = this.elections.get(electionId);
        console.log(this.elections);
        if (!election || election.status !== "active") {
            salert("Invalid or inactive election")
        }

        const input = {
            numCandidates: election.numCandidates.toString(),
            electionId: electionId,
            candidateIndex: candidateIndex.toString(),
            r: nonce.toString()
        };
        try {
            const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
                input,
                require('./zk/build/election_js/election.wasm'),
                require('./zk/output/election_final.zkey')
            );

            return { proof, publicSignals };
        } catch (error) {
            console.error("Proof generation error:", error);
            throw error;
        }
    }


    async finalizeElection(electionId, signature) {
        const election = await this.app.storage.loadTransactions(
          { field1: 'Vote', signature },
          (txs) =>
            txs.find(
              (tx) =>
                tx.returnMessage().request === "create election" &&
                tx.returnMessage().data.electionId === electionId
            ),
          "localhost"
        );

        console.log(election, "election found")
      
        if (!election) {
          throw new Error("Election not found or you are not the creator.");
        }
    
        const votes = election.msg.data.votes || {};
    
        const tally = new Array(election.msg.data.numCandidates).fill(0);
    
        for (const [nullifier, voteData] of Object.entries(votes)) {
          const candidateIndex =
            BigInt(voteData.commitment) % BigInt(election.msg.data.numCandidates);
    
          tally[Number(candidateIndex)]++;
        }
    
        election.msg.data.finalTally = tally;
        election.msg.data.status = "finalized";
    
        await this.app.storage.updateTransaction(election, {}, "localhost");
        
        console.log(tally, "election tally")
        return tally;
      }
      
    // Network message handlers
    async sendVerifyVoteTransaction(params = {}, callback = null) {
        const peers = await this.app.network.getPeers();
        if (peers.length === 0) {
            throw new Error("No peers available");
        }

        await this.app.network.sendRequestAsTransaction(
            "verify vote",
            params,
            callback,
            peers[0].peerIndex
        );
    }



    async sendCreateElectionTransaction(params = {}, callback = null) {
        const peers = await this.app.network.getPeers();
        if (peers.length === 0) {
            throw new Error("No peers available");
        }

        const request = 'create election'
        let currentId = await this.fetchCurrentElectionId();

        console.log(currentId)

        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);
        newtx.msg = {
            module: this.name,
            request,
            data: {
                ...params,
                electionId: currentId
            }
        };

        await newtx.sign();
        await this.app.network.propagateTransaction(newtx);

        if (callback) {
            this.callbackAfterCreate = callback
        }
        return true;
    }

    async receiveCreateElectionTransaction( tx) {
            const message = tx.returnMessage();
            const { numCandidates, candidateNames, description } = message.data;
            try {
                await this.saveElectionTransaction(tx);
                if (this.callbackAfterCreate) {
                    this.callbackAfterCreate()
                    siteMessage("Election created successfully")
                }

            } catch (error) {
                console.log(error);
            }

    }

    async sendSubmitVoteTransaction(params = {}, callback = null) {
        const peers = await this.app.network.getPeers();
        if (peers.length === 0) {
            throw new Error("No peers available");
        }

        // Generate the proof before sending
        const { signature, electionId, candidateIndex, nonce, } = params;
        console.log(electionId, candidateIndex, nonce,)

        let nullifier = await this.createNullifier(electionId)
        console.log('nullifier ', nullifier)
        try {
            // Generate proof
            const { proof, publicSignals } = await this.generateVoteProof(
                electionId,
                candidateIndex,
                nonce,
                nullifier
            );

            // Send transaction with proof and nullifier
            await this.app.network.sendRequestAsTransaction(
                "submit vote",
                {
                    signature,
                    electionId,
                    proof,
                    publicSignals,
                    nullifier
                },
                callback,
                peers[0].peerIndex
            );
            // this.callBackAfterVote = callback
        } catch (error) {
            throw error;
        }
    }

    async receiveSubmitVoteTransaction(app, tx, peer, callback) {
        if (app.BROWSER == 0) {
          const message = tx.returnMessage();
          const { signature, electionId, proof, publicSignals, nullifier } = message.data;
      
          // Prevent double voting via nullifier check:
          let isUsed = await this.isNullifierUsed(signature, electionId, nullifier);
          if (isUsed) {
            if (callback) {     
              return callback({
                success: false,
                message: "Error: Double voting detected"
              });
            }

            return;
          }

      
          // Verify proof on submission:
          const verified = await snarkjs.groth16.verify(
            this.vkey,
            publicSignals,
            proof
          );
          if (!verified) {
            if (callback) {
              callback({
                success: false,
                message: "Could not verify proof"
              });
            }
            return;
          }
      
          try {
            await this.app.storage.loadTransactions(
              { signature, field1: 'Vote' },
              async (txs) => {
                if (txs?.length > 0) {
                  const electionTx = txs[0];
                  if (!electionTx.msg.data.votes) {
                    electionTx.msg.data.votes = {};
                  }
    
                  electionTx.msg.data.votes[nullifier] = {
                    commitment: publicSignals[0], 
                    proof,
                    publicSignals,
                    timestamp: Date.now()
                  };
      
                  // Update transaction in storage
                  await this.app.storage.updateTransaction(electionTx, {}, "localhost");
      
                  if (callback) {
                    callback({ success: true, message: "Vote recorded successfully" });
                  }
                }
              },
              "localhost"
            );
          } catch (error) {
            if (callback) {
              return callback({
                success: false,
                message: error
              });
            }
          }
        }
      }
      
    async sendFinalizeElectionTransaction(params = {}, callback = null) {
        const peers = await this.app.network.getPeers();
        if (peers.length === 0) throw new Error("No peers available");

        await this.app.network.sendRequestAsTransaction(
            "finalize election",
            params,
            callback,
            peers[0].peerIndex
        );
        return true;
    }

    async receiveFinalizeElectionTransaction(app, tx, peer, callback) {
        console.log('receiving finalize election tx')
        if (app.BROWSER !== 0) return;
        
        const message = tx.returnMessage();
        const { electionId, signature } = message.data;

    
        try {
            const tally = await this.finalizeElection(electionId, signature);
            if(callback) callback({success: true, tally});
        } catch (error) {
            if(callback) callback({success: false, error: error.message});
        }
    }

    async finalizeElection(electionId, signature) {
        const election = await this.app.storage.loadTransactions(
            { field1: 'Vote', signature },
            (txs) => txs.find(tx => 
                tx.returnMessage().request === "create election" &&
                tx.returnMessage().data.electionId === electionId
            ),
            "localhost"
        );

        if (!election) throw new Error("Election not found");
        const votes = election.msg.data.votes || {};
        const tally = new Array(election.msg.data.numCandidates).fill(0);
    
        for (const [nullifier, voteData] of Object.entries(votes)) {
            // Extract candidate index from commitment using modulo
            const candidateIndex = BigInt(voteData.commitment) % BigInt(election.msg.data.numCandidates);
            tally[Number(candidateIndex)]++;
        }
    
        election.msg.data.finalTally = tally;
        election.msg.data.status = "finalized";
    
        await this.app.storage.updateTransaction(election, {}, "localhost");
        return tally;
    }
    webServer(app, expressapp, express) {
        let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
        let mod_self = this;

        expressapp.get(
            '/' + encodeURI(this.returnSlug()),
            async function (req, res) {
                let reqBaseURL = req.protocol + '://' + req.headers.host + '/';
                let updatedSocial = Object.assign({}, mod_self.social);
                updatedSocial.url = reqBaseURL + encodeURI(mod_self.returnSlug());
                res.setHeader('Content-type', 'text/html');
                res.charset = 'UTF-8';
                res.send(pageHome(app, mod_self, app.build_number, updatedSocial));
                return;
            }
        );

        expressapp.use(
            '/' + encodeURI(this.returnSlug()),
            express.static(webdir)
        );

        expressapp.use(`/${this.slug}`, express.static(__dirname + '/web'));


    }

    async render() {
        this.header = new SaitoHeader(this.app, this);
        await this.header.initialize(this.app);
        this.addComponent(this.header);
        await super.render(this.app, this);

    }


    async getVoteCount(electionId, signature) {
        console.log(electionId, signature, 'vote count')
        let peers = await this.app.network.getPeers();
        let peer = peers[0];
        return new Promise(async (resolve) => {
            await this.app.storage.loadTransactions(
                { field1: 'Vote', signature: signature },
                (txs) => {

                    console.log(txs, 'election transaction')
                    const electionTx = txs.find(tx =>
                        tx.returnMessage().request === "create election" &&
                        tx.returnMessage().data.electionId === electionId
                    );


                    if (electionTx && electionTx.msg.data.votes) {
                        resolve({
                            totalVotes: Object.keys(electionTx.msg.data.votes).length,
                            timestamp: Date.now()
                        });
                    } else {
                        resolve({ totalVotes: 0, timestamp: Date.now() });
                    }
                },
                peer
            );
        });
    }

    async isNullifierUsed(signature, electionId, nullifier) {
        return new Promise(async (resolve) => {
            await this.app.storage.loadTransactions(
                { field1: 'Vote', signature },
                (txs) => {
                    const electionTx = txs.find(tx =>
                        tx.returnMessage().request === "create election" &&
                        tx.returnMessage().data.electionId === electionId
                    );

                    console.log(electionTx, "election")

                    if (electionTx && electionTx.msg.data.votes) {
                        resolve(nullifier in electionTx.msg.data.votes);
                    } else {
                        resolve(false);
                    }
                },
                "localhost"
            );
        });
    }

    async loadVoteLayout() {
        this.app.browser.createReactRoot(VoteLayout, { app: this.app, mod: this }, 'vote-layout');
    }

    async createNullifier(electionId) {
        const preimage = `${this.publicKey}-${electionId}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(preimage);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

module.exports = Vote;