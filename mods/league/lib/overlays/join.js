const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const JoinLeagueTemplate = require("./join.template");
const SaitoLoader = require("./../../../../lib/saito/ui/saito-loader/saito-loader");


class JoinLeague {

  constructor(app, mod, league_id=""){
    this.app = app;
    this.mod = mod;
    this.league_id = league_id;
    this.overlay = new SaitoOverlay(app, mod, false, true);
    this.loader = new SaitoLoader(app, mod, ".league-join-overlay-box");
    this.timer = null;

    this.app.connection.on("join-league-success", ()=>{
      console.log("League Join success!");
      if (this.timer){
        clearTimeout(this.timer);
      }else{
        return;
      }
      this.loader.remove();
      this.render();
    });
  }

  async render() {

    let league = this.mod.returnLeague(this.league_id);

    if (league == null) {
      salert(`League not found`);
      console.log("League id: " + this.league_id);
      return;
    }


    this.game_mod = this.app.modules.returnModuleByName(league.game);
    this.overlay.show(JoinLeagueTemplate(this.app, this.mod, league), ()=>{
      this.app.connection.emit('league-overlay-render-request', this.league_id);  
    });
    this.overlay.setBackground(this.game_mod.returnArcadeImg());

    this.attachEvents();

  }


  attachEvents() {

    // Phase 1
    const league_join_btn = document.getElementById('league-join-btn');

    if (league_join_btn){
      league_join_btn.onclick = (e) => {

        window.history.pushState("", "", window.location.pathname);
        e.preventDefault();

        let league_id = e.target.getAttribute("data-id");
        //let key = this.app.keychain.returnKey(this.app.wallet.returnPublicKey());
        //let user_email = key.email || "";

        //
        // show loader
        //
        document.querySelector(".title-box").remove();
        document.querySelector(".league-join-controls").remove();
        document.querySelector(".league-join-info").remove();
        this.loader.render();

        let newtx = this.mod.createJoinTransaction(league_id/*, user_email*/);
        this.app.network.propagateTransaction(newtx);

        if (this.mod.debug){
          console.log("Join sent! " + league_id);
        }

        let params = {
          publickey: this.app.wallet.returnPublicKey(),
        }
        this.mod.addLeaguePlayer(league_id, params);

        this.timer = setTimeout(()=> {
          
          this.loader.remove();
          this.render();

        }, 2000);

      }  

      document.querySelector('.saito-overlay-form-alt-opt').onclick = (e) => {
        this.app.connection.emit("recovery-login-overlay-render-request");
        return;
      };

    }else{
      document.querySelector('#gonow').onclick = (e) => {
        this.app.connection.emit('league-overlay-render-request', this.league_id);
        this.overlay.remove();
      }

      let countDown = document.getElementById("countdown");
      let timer = 5;
      let interval = setInterval(()=>{
        timer--;
        countDown.innerHTML = timer;
        if (timer === 0){
          clearInterval(interval);
          this.app.connection.emit('league-overlay-render-request', this.league_id);
          this.overlay.remove();
        }        
      }, 1000);
    }




  }
}

module.exports = JoinLeague;

