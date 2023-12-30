const ModTemplate = require("./../../lib/templates/modtemplate");
const PeerService = require("saito-js/lib/peer_service").default;

class Spam extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.slug = "spam";
    this.name = "spam";
    this.description = "Tool to generate spam txs";
    this.categories = "Core Utilities Messaging";
    this.publickey = "";
    this.loop_start = 0;
    this.frequency = 1; //no of tx per period
    this.period = 1000;
    this.interval = null;
    this.loop_count = 0;
    this.nodeSpamPerSecond = 5000;

    this.styles = ["/spam/style.css", "/saito/saito.css"];

    return this;
  }

  initialize(app) {
    super.initialize(app);
    if (this.browser_active) {
      this.styles = ["/spam/style.css", "/saito/saito.css"];
    }
    if (this.app.BROWSER == 0) {
      setInterval(() => {
        this.nodeSpamLoop(app, this);
      }, 1000);
    }
  }

  async render() {
    if (!this.browser_active) {
      return;
    }
    let this_mod = this;

    let start = document.querySelector(".start");
    start.onclick = (e) => {
      this_mod.frequency = document.querySelector("#frequency").value;
      this_mod.period = document.querySelector("#period").value * 1000;

      document.querySelector(".spam-loop-count").innerHTML = this_mod.loop_count;
      document.querySelector(".spam-loop-dot").style.backgroundColor = "green";

      this_mod.loop_start = 1;
      this_mod.changeLoopStatus();
    };

    let stop = document.querySelector(".stop");
    stop.onclick = (e) => {
      this_mod.loop_start = 0;
      document.querySelector(".spam-loop-dot").style.backgroundColor = "red";
      this_mod.changeLoopStatus();
    };

    let reset = document.querySelector(".reset");
    reset.onclick = (e) => {
      this_mod.loop_start = 0;
      this_mod.frequency = 1;
      this_mod.period = 1000;
      this_mod.interval = null;
      this_mod.loop_count = 0;

      document.querySelector(".spam-loop-count").innerHTML = "0";
      document.querySelector(".spam-loop-dot").style.backgroundColor = "red";
      document.querySelector("#frequency").value = 1;
      document.querySelector("#period").value = 1;
      this_mod.changeLoopStatus();
    };
  }

  nodeSpamLoop(app, mod) {
    console.info("Sending heartbeat spam tx: " + mod.loop_count);
    for (let i = 0; i < this.nodeSpamPerSecond; i++) {
      mod.sendSpamTransaction(app, mod, { tx_num: mod.loop_count });
      mod.loop_count++;  
    }
  }

  changeLoopStatus() {
    let this_mod = this;
    if (this.loop_start == 1) {
      console.log("starting loop ..");
      console.log("txs per second: " + (1000 / this_mod.period) * this_mod.frequency);

      this.interval = setInterval(function () {
        document.querySelector(".spam-loop-count").innerHTML = this_mod.loop_count;
        this_mod.sendSpamTransaction(this_mod.app, this_mod.mod, { tx_num: this_mod.loop_count });
        this_mod.loop_count++;
      }, Math.floor(this_mod.period / this_mod.frequency));
    } else {
      console.log("stop loop ..");

      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();
    try {
      if (conf == 0) {
        if (txmsg.request === "send spam tx") {
          await this.receiveSpamTransaction(blk, tx, conf);
        }
      }
    } catch (err) {
      console.log("ERROR in " + this.name + " onConfirmation: " + err);
    }
  }

  async sendSpamTransaction(app, mod, data) {
    let obj = {
      module: this.name,
      request: "send spam tx",
      data: {},
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await this.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    await newtx.sign();
    // console.log('tx: ' + data.tx_num);
    // console.log(newtx);
    await this.app.network.propagateTransaction(newtx);

    return newtx;
  }

  async receiveSpamTransaction(blk, tx, conf) {
    try {
      //
      // browsers
      //
      // if (this.app.BROWSER == 1) {
      //   return;
      // }
      // console.log("Received tx: ");
      // console.log(tx);
    } catch (err) {
      console.log("ERROR in saving migration data to db: " + err);
    }
  }
}

module.exports = Spam;
