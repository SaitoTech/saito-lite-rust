const LeagueComponentAdminBoxTemplate = require("./admin-box.template");


module.exports = AdminBox = {

  constructor(app, mod, game_mod=null) {

    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;

    app.connection.on("league-update", (league) => {
      console.log("ADMIN BOX RECEIVES EVENT -- re-renders?");
    });

  }

  render(app, mod, games) {
    if (!document.getElementById("game-selector")){
      app.browser.addElementToDom(LeagueComponentAdminBoxTemplate(app, mod, games), "league-main-container-games");
      this.attachEvents(app, mod);
    }
  },


  attachEvents(app, mod) {
    let box = document.querySelector('.league-component-admin-box-form');
    if (!box) {return;}
    
    let desc = document.getElementById("league-desc");
    if (desc){
      desc.addEventListener("focus", function(e){
        let value = e.target.innerHTML;
        if (value == desc.getAttribute("data-placeholder")){
          e.target.innerHTML = "";
        }
      });
    }

    box.onsubmit = (e) => {
      e.preventDefault();
      let leaguename = sanitize(document.getElementById("league-name")?.textContent || e.target.game.value);
      let leaguedesc = sanitize(desc?.textContent) || "";
      if (leaguedesc === desc.getAttribute("data-placeholder")){
        leaguedesc = "";
      }
      let newLeague = {
        game: e.target.game.value,
        type: e.target.type.value,
        admin: app.wallet.returnPublicKey(),
        name: leaguename,
        description: leaguedesc,
        ranking: e.target.ranking.value,
        starting_score: e.target.starting_score.value,
        max_players: e.target.max_players.value
      };
      document.getElementById("league-details").style.display = "none";
      mod.sendCreateLeagueTransaction(newLeague);
      return false;
    }
    
      
    let selector = document.querySelector("#league-game");
    if (selector){
      selector.onchange = (e) =>{
        //Refresh game specific information
        let gamename = selector.value;
        try{
          if (gamename){
            document.querySelector("#league-details img").src = selector.querySelector(`#${gamename}`).getAttribute("data-img");
            document.querySelector("#league-name").textContent = gamename;
            document.querySelector("#league-desc").textContent = "";
            document.querySelector("#game").value = gamename;
            document.getElementById("league-details").style.display = "block";
            if (desc.innerHTML === ""){
              desc.innerHTML = desc.getAttribute("data-placeholder");
            }
          }else{
            document.getElementById("league-details").style.display = "none";
          }

        }catch(err){console.log(err);}
      };
    }

    let startDiv = document.querySelector("#starting_score");
    let rankDiv = document.querySelector("#ranking");
    if (startDiv && rankDiv){
      rankDiv.onchange = (e) => {
        if (rankDiv.value == "elo"){
          startDiv.value = 1000;
          startDiv.style.display = "block";
        }else{
          startDiv.value = 0;
          startDiv.style.display = "none";
        }
      };
    }
    
  }
}



