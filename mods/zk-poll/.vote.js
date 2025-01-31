const ModTemplate = require("../../lib/templates/modtemplate");
// const circomlibjs = require("circomlibjs");
const snarkjs = require('snarkjs')
const fs = require('fs');
const pageHome = require('./index');
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const { default: VoteLayout } = require("./lib/Vote-layout");
const vkey = require('./zk/output/verification_key.json')



class Vote extends ModTemplate {
    constructor(app) {
        super(app);
        this.app = app;
        this.name = 'Vote';
        this.slug = 'vote';
        this.styles = ['/saito/saito.js', '/vote/style.css']
    }


    async sendVerifyProofTransaction(params = {}, callback = null) {
        let peers = await this.app.network.getPeers();
        if (peers.length == 0) {
            console.warn("No peers");
            return;
        }

        await this.app.network.sendRequestAsTransaction(
            "verify vote proof",
            params,
            function (res) {
                console.log("Verification response received:", res);
                if (callback) {
                    return callback(res);
                }
            },
            peers[0].peerIndex
        );
    }

    async handlePeerTransaction(app, tx = null, peer, mycallback) {
        if (tx == null) {
            return 0;
        }
        let message = tx.returnMessage();

        if (message.request === "verify vote proof") {
            await this.receiveVerifyProofTransaction(app, tx, peer, mycallback);
        }

        return super.handlePeerTransaction(app, tx, peer, mycallback);
    }

    async receiveVerifyProofTransaction(app, tx, peer, callback) {
        if (app.BROWSER == 0) {  
            const message = tx.returnMessage();
            const { proof, publicSignals } = message.data;
    
            try {
                const verified = await snarkjs.groth16.verify(
                    vkey,
                    publicSignals,
                    proof
                );
    
                if (callback) {
                    if (!verified) {
                        return callback({
                            success: false,
                            message: "Invalid proof"
                        });
                    }
                    
                    let isAgeValid = publicSignals[0] === "1";
                    return callback({
                        success: isAgeValid,
                        message: isAgeValid 
                            ? "Proof verified successfully" 
                            : "Age requirement not met"
                    });
                }
            } catch (error) {
                console.error("Proof verification error:", error);
                if (callback) {
                    return callback({
                        success: false,
                        message: "Error verifying proof",
                        error: error.message
                    });
                }
            }
        }
    }

    async verifyAge(age) {
        try {
            const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
                { age: BigInt(age).toString() },  
                require('./zk/build/age_verifier_js/age_verifier.wasm'),
                require('./zk/output/circuit_final.zkey')
            );

            return new Promise((resolve, reject) => {
                this.sendVerifyProofTransaction(
                    { proof, publicSignals },
                    (response) => {
                        if (response.success) {
                            resolve(true);
                        } else {
                            reject(new Error(response.message));
                        }
                    }
                );
            });
        } catch (error) {
            console.error("Age verification error:", error);
            throw error;
        }
    }


    async render() {
        this.header = new SaitoHeader(this.app, this);
        await this.header.initialize(this.app);
        this.addComponent(this.header);
        await super.render(this.app, this);
        this.loadVoteLayout()
    }


    async loadVoteLayout() {
        this.app.browser.createReactRoot(VoteLayout, { app: this.app, mod: this }, 'vote-layout');
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

}

module.exports = Vote;