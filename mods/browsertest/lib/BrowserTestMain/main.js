const MainTemplate = require("./Main.Template");

class Main {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {
    this.app.browser.addElementToSelector(MainTemplate());
    this.attachEvents();
  }

  attachEvents() {
    var button1 = document.querySelector(".flex-button-container .flex-button:nth-child(1)");
    var button2 = document.querySelector(".flex-button-container .flex-button:nth-child(2)");
    var button3 = document.querySelector(".flex-button-container .flex-button:nth-child(3)");

    button1.addEventListener("click", this.handleButton1Click.bind(this));
    button2.addEventListener("click", this.handleButton2Click.bind(this));
    button3.addEventListener("click", this.handleButton3Click.bind(this));
  }

  async handleButton1Click() {
    console.log("Button 1 clicked!");

    console.log(this.app.wallet.publicKey, "public key");
    console.log(Number(await this.app.blockchain.instance.get_latest_block_id()), "blockchain");
  }

  handleButton2Click() {
    console.log("Button 2 clicked!");
    // Add desired functionality for Button 2 here
  }

  handleButton3Click() {
    console.log("Button 3 clicked!");
    // Add desired functionality for Button 3 here
  }
}

module.exports = Main;
