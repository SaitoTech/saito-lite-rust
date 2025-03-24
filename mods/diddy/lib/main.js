const DiddyMainTemplate = require('./main.template');
const DiddyStylesTemplate = require('./main.styles.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class DiddyMain {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;

    this.rechargeInterval = null;
    this.onCooldown = false;
  }

  render() {
    if (document.querySelector('.main-container')) {
      this.app.browser.replaceElementBySelector(DiddyMainTemplate(), '.main-container');
      this.app.browser.replaceElementBySelector(DiddyStylesTemplate(), '.main-styles-container');
    } else {
      this.app.browser.addElementToDom(DiddyMainTemplate());
      this.app.browser.addElementToDom(DiddyStylesTemplate());
    }

    try {
      // console.log("Rendering DiddyMain...");
      // console.log("Energy from backend:", this.mod.diddy.energy, "/", this.mod.diddy.maxEnergy);

      document.querySelector(".text-number").innerHTML = this.mod.diddy.count;

      const levelElement = document.getElementById('level');
      if (levelElement) {
        levelElement.innerHTML = `Level ${this.mod.diddy.level}`;
      }

      const energyElement = document.getElementById("energy");
      if (energyElement) {
        energyElement.innerText = `${this.mod.diddy.energy} / ${this.mod.diddy.maxEnergy}`;
      } else {
        // console.error("#energy element not found in the DOM.");
      }
    } catch (err) {
      // console.error("Error updating UI:", err);
    }

    this.attachEvents();
    this.startRecharge(); 
  }

  attachEvents() {
    const characterImage = document.getElementById("character-image");
    if (characterImage) {
      characterImage.onclick = () => this.clickCoinButton();
    }

    const walletButtonContainer = document.querySelector(".wallet-button-container");
    if (walletButtonContainer) {
      walletButtonContainer.onclick = () => {
        // console.log("Wallet button container clicked!");
        const saitoHeaderMenuToggle = document.getElementById("saito-header-menu-toggle");
        if (saitoHeaderMenuToggle) {
          saitoHeaderMenuToggle.click();
          // console.log("Saito header menu toggle clicked successfully.");
        } else {
          // console.error("Saito header menu toggle button not found.");
        }
      };
    } else {
      // console.error("Wallet button container not found in the DOM.");
    }
}

  async clickCoinButton() {
    // console.log("Coin button clicked!");

    if (this.mod.diddy.energy <= 0) {
      // console.log("No energy left! Please wait for recharge.");
      return;
    }

    this.mod.diddy.count += 1;
    this.mod.diddy.energy -= 1;
    this.mod.recalculateState();

    this.updateUI();

    this.mod.save();

    if (this.mod.diddy.count % 20 === 0) {
      const newtx = await this.mod.createClickTransaction();
      this.app.network.propagateTransaction(newtx);
      // console.log("Transaction propagated for every 20 clicks.");
    }
  }

  updateUI() {
    // console.log(`Updating UI: Energy = ${this.mod.diddy.energy}, Max Energy = ${this.mod.diddy.maxEnergy}`);

    document.querySelector('.text-number').innerText = this.mod.diddy.count;

    const levelElement = document.getElementById('level');
    if (levelElement) {
      levelElement.innerHTML = `Level ${this.mod.diddy.level}`;
    }

    const energyElement = document.getElementById("energy");
    if (energyElement) {
      energyElement.innerText = `${this.mod.diddy.energy} / ${this.mod.diddy.maxEnergy}`;
    }

    const energyFill = document.getElementById('energy-fill');
    if (energyFill) {
      energyFill.style.width = (this.mod.diddy.energy / this.mod.diddy.maxEnergy) * 100 + '%';
    }
  }

  startRecharge() {
    if (this.rechargeInterval) {
      clearInterval(this.rechargeInterval); 
    }

    let fractionalEnergy = 0;

    this.rechargeInterval = setInterval(() => {
      if (this.mod.diddy.energy < this.mod.diddy.maxEnergy) {
        fractionalEnergy += this.mod.diddy.rechargeRate;

        const wholeRecharge = Math.floor(fractionalEnergy);
        if (wholeRecharge > 0) {
          this.mod.diddy.energy += wholeRecharge;

          if (this.mod.diddy.energy > this.mod.diddy.maxEnergy) {
            this.mod.diddy.energy = this.mod.diddy.maxEnergy;
          }

          fractionalEnergy -= wholeRecharge;
        }

        this.updateUI();
        // console.log(`Recharging... Energy: ${this.mod.diddy.energy}`);
      }

      this.mod.diddy.lastUpdated = Date.now();
      this.mod.save();
    }, 1000);
  }

  stopRecharge() {
    if (this.rechargeInterval) {
      clearInterval(this.rechargeInterval);
      this.rechargeInterval = null;
    }
  }
}

module.exports = DiddyMain;
