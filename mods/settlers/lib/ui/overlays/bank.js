const BankOverlayTemplate = require("./bank.template");
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class BankOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.selected_resource = null;
    this.my_resources = {};
    this.minForTrade = null;
  }

  render() {

    this.my_resources = {};
    
    this.minForTrade = this.mod.analyzePorts(); //4;  //1) Fix to have 3:1 port, 2) Fix for resource specific 2:1 ports

    console.log(this?.selected_resource);

    for (let resource of this.mod.returnResources()) {
      let temp = this.mod.countResource(
        this.mod.game.player,
        resource
      );      
      if (temp >= this.minForTrade[resource]) this.my_resources[resource] = temp;
    }

    this.overlay.show(BankOverlayTemplate(this.app, this.mod, this));
    this.attachEvents();
  }

  attachEvents() {
    this_bank = this;

    if (this_bank.selected_resource){
      document.querySelectorAll(".settlers-desired-resources img").forEach((row) => {
        row.onclick = (e) => {

          let desired_resource = e.currentTarget.getAttribute("id");

          this_bank.mod.addMove(
            `bank\t${this_bank.mod.game.player}\t${this_bank.minForTrade[this_bank.selected_resource]}\t${this_bank.selected_resource}\t1\t${desired_resource}`
          );
          this_bank.mod.endTurn();
          this_bank.overlay.hide();
          this_bank.selected_resource = null;
          return;
        }
      });
    }else{
      document.querySelectorAll(".settlers-trade-resources").forEach((row) => {
        row.classList.remove("selected");

        row.onclick = (e) => {

          let target = e.currentTarget;

          this_bank.selected_resource = target.getAttribute("id");

          this_bank.render();

          //row.classList.add("selected");
          //document.querySelector(".settlers-items-container-desired-resources").classList.remove("hide");
        }
      }); 

    }
  }

}

module.exports = BankOverlay;

