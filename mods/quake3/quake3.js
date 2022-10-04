const GameTemplate = require('./../../lib/templates/gametemplate');


class Quake3 extends GameTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name = "Quake3";
    this.description = "Quake3-Saito Interface";
    this.categories = "Games Entertainment";

    this.maxPlayers      = 1;
    this.minPlayers      = 1;

    //
    // when we join a game, we remember the name
    //
    this.player_name_identified = false;
    this.player_name = "";

  }






  initializeGame(game_id) {

    console.log("SET WITH GAMEID: " + game_id);

    if (!this.game.state) {
      console.log("******Generating the Game******");
      this.game.state = {};
      this.game.queue = [];
      this.game.queue.push("READY");
    }

  }











  initialize(app) {

    //
    // divert console.log to track player name
    //
    {
      const log = console.log.bind(console)
      console.log = (...args) => {
	if (args.length > 0) {
	  if (typeof args[0] === 'string') {
            let pos = args[0].indexOf(" entered the game");
            if (pos > -1 && this.player_name_identified == false) {    
	      this.player_name = args[0].substring(0, pos);
  	      this.player_name_identified = true;
              log("-----------------");
              log("PLAYER NAME: " +this.player_name);
              log("-----------------");
            }
          }
          log(...args);
        }
      }
    }

  }





  initializeHTML(app) {

    console.log("INITIALIZE HTML in Quake3 - 1");

    if (this.browser_active != 1) { return; }

    console.log("INITIALIZE HTML in Quake3 - 2");



console.log(" 1=========");
    super.initializeHTML(app);

console.log(" 2=========");
console.log(" 3=========");
console.log(" 4=========");

    //
    // ADD MENU
    //
    this.menu.addMenuOption({
      text : "Game",
      id : "game-game",
      class : "game-game",
      callback : function(app, game_mod) {
        game_mod.menu.showSubMenu("game-game");
      }
    });

    this.menu.addSubMenuOption("game-game", {
        text : "Q3-Shot",
        id : "game-post",
        class : "game-post",
        callback : async function(app, game_mod) {
          let m = game_mod.app.modules.returnModule("RedSquare");
          if (m){
            let log = document.getElementById("log-wrapper");
            if (log && !log.classList.contains("log_lock")) { log.style.display = "none"; }
            let menu = document.getElementById("game-menu");
            menu.style.display = "none";
            await app.browser.screenshotCanvasElementById("viewport", function(image) {
              if (log && !log.classList.contains("log_lock")) { log.style.display = "block"; }
              menu.style.display = "block";
              m.tweetImage(image);
            });
          }
        },
    });


console.log(" 5--------");

    this.menu.addChatMenu(app, this);

console.log(" 6--------");

    this.menu.render(app, this);

console.log(" 1=========");
console.log(" 2=========");
console.log(" 3=========");
console.log(" 4=========");



    //
    // helper functions
    //
    let getQueryCommands = function() {

      var search = /([^&=]+)/g;
      var query  = window.location.search.substring(1);
      var args = [];
      var match;

      while (match = search.exec(query)) {
        var val = decodeURIComponent(match[1]);
        val = val.split(' ');
        val[0] = '+' + val[0];
        args.push.apply(args, val);
      }
       return args;
    };

    let resizeViewport = function() {
      if (!ioq3.canvas) { return; }
      if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] || document['mozFullScreenElement'] || document['mozFullscreenElement'] || document['fullScreenElement'] || document['fullscreenElement'])) {
        return;
      }
      ioq3.setCanvasSize(ioq3.viewport.offsetWidth, ioq3.viewport.offsetHeight);
    }

    ioq3.viewport = document.getElementById('viewport-frame');
    ioq3.elementPointerLock = true;
    ioq3.exitHandler = function (err) {

      if (err) {
        var form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', '/');
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', 'error');
        hiddenField.setAttribute('value', err);
        form.appendChild(hiddenField);

        document.body.appendChild(form);
        form.submit();
        return;
      }

      window.location.href = '/';
    }

    window.addEventListener('resize', resizeViewport);

    // merge default args with query string args
    //var args = ['+set', 'fs_cdn', 'content.quakejs.com:80', '+set', 'sv_master1', 'master.quakejs.com:27950']; //original args to list the servers from master.quakejs.com
    //var args = ['+set', 'fs_cdn', 'content.quakejs.com:80', '+set', 'sv_master1', 'master.quakejs.com:27950', '+connect', 'YOUR_SERVER_HERE:27960']; //additional +connect arguement to connect to a specific server
    var args = ['+set', 'fs_cdn', '18.163.184.251:80', '+connect', '18.163.184.251:27960']; //custom args list targeting a local content server and local game server both at the address 'quakejs'
    args.push.apply(args, getQueryCommands());
    ioq3.callMain(args);

  }

}

module.exports = Quake3;

