
class Banner {
	
  constructor(app, mod, container="", invite) {
    this.app = app;
    this.mod = mod;
  }

  render() {

    let html = `
      <div id="arcade-banner" class="arcade-banner">
        <div class="saito-carousel">
          <div class="carousel-wrapper">
            <img class="carousel-spacer" src="./img/16by5.png" />
          </div>
        </div>
      </div>
    `;

    if (document.querySelector(".arcade-banner")) {
      this.app.browser.replaceElementBySelector(html, ".arcade-banner");
    } else {
      this.app.browser.addElementToSelector(html, this.container);
    }


    for (let i = 0; i < this.mod.game_mods.length; i++) {
      let html = `
            <div class="leaf" style="background: url(/${this.mod.game_mods[i].returnSlug()}/img/arcade/arcade-banner-background.png);background-size:cover">
              <div class="big">${this.mod.game_mods[i].returnName()}</div>
            </div>
      `;
      this.app.browser.addElementToSelector(html, ".carousel-wrapper");
    }


    this.attachEvents();
  }


  attachEvents() {
  }

};

module.exports = Banner;

