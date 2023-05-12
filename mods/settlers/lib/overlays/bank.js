const BankOverlayTemplate = require("./bank.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class BankOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.selected_resource = null;
    this.desired_resource = null;
    this.my_resources = {};
    this.minForTrade = null;
  }

  render() {

    this.selected_resource = null;
    this.desired_resource = null;
    this.my_resources = {};
    this.minForTrade = null
    
    this.minForTrade = this.mod.analyzePorts(); //4;  //1) Fix to have 3:1 port, 2) Fix for resource specific 2:1 ports
                
    for (let resource of this.mod.skin.resourceArray()) {
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
    document.querySelectorAll(".settlers-trade-resources").forEach(function(row, k){
      row.classList.remove("selected");

      row.onclick = (e) => {
        let target = e.currentTarget;

        this_bank.selected_resource = target.getAttribute("id");
        row.classList.add("selected");

        document.querySelector(".settlers-items-container-desired-resources").classList.remove("hide");
      }
    }); 


    document.querySelectorAll(".settlers-desired-resources img").forEach(function(row, k){
      row.onclick = (e) => {
        let target = e.currentTarget;
        this_bank.desired_resource = target.getAttribute("id");

        this_bank.mod.addMove(
          `bank\t${this_bank.mod.game.player}\t${this_bank.minForTrade[this_bank.selected_resource]}\t${this_bank.selected_resource}\t1\t${this_bank.desired_resource}`
        );
        this_bank.mod.endTurn();
        this_bank.overlay.hide();
        return;

      }
    });

  }

}

module.exports = BankOverlay;

