const ImperiumProductionOverlayTemplate = require("./production.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class ProductionOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.cost_limit = 0;
    this.production_limit = 0;
    this.available_resources = 0;
    this.available_units = [];
    this.selectUnit = null;
    this.submitBuild = null;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }


  render(cost_limit, production_limit, available_resources, selectUnit, submitBuild, available_units) {
    
    this.cost_limit = cost_limit;
    this.production_limit = production_limit;
    this.available_resources = available_resources;
    this.selectUnit = selectUnit;
    this.submitBuild = submitBuild;
    this.available_units = available_units;

    this.overlay.show(ImperiumProductionOverlayTemplate(this.mod, available_resources, production_limit, cost_limit, available_units));
    this.attachEvents();

  }

  reset() {
    document.querySelectorAll(".production-table .unit-table.small .unit-element").forEach((el) => {
      let desc = el.querySelector(".unit-description");
      desc.setAttribute("data-amount", 0);
      let name = desc.getAttribute("data-name");
      desc.innerHTML = name;
      desc.classList.remove("highlight");
    });
  }


  attachEvents() {

    document.querySelectorAll(".production-table .unit").forEach((el) => {
      el.onclick = (e) => {
        let desc = el.querySelector(".unit-description");
	let amount = parseInt(desc.getAttribute("data-amount"));
	let name = desc.getAttribute("data-name");
	let type = desc.getAttribute("data-type");
	amount++;
	desc.setAttribute("data-amount", amount);
        desc.innerHTML = amount + "x " + name;
	desc.classList.add("highlight");
	// goes last!
	this.selectUnit(type);
      }
    });

    document.querySelector(".production-button").onclick = (e) => {
      this.overlay.remove();
      this.submitBuild();
    }

  }
}

module.exports = ProductionOverlay;

