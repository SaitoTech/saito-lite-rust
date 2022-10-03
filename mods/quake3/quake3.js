const GameTemplate = require('./../../lib/templates/gametemplate');


class Quake3 extends GameTemplate {

  constructor(app) {
    super(app);
    this.app = app;
    this.name = "Quake3";
    this.description = "Quake3-Saito Interface";
    this.categories = "Games Entertainment";

    this.player_name_identified = false;
    this.player_name = "";

    return this;
  }



  initializeHTML(app) {

    //
    // can we access ioq3 from inside Saito?
    //
    console.log("-------------------------");
    console.log("ABOUT TO INITIALIZE QUAKE");
    console.log("-------------------------");


    {
      const log = console.log.bind(console)
      console.log = (...args) => {

        let pos = args[0].indexOf(" entered the game");
        if (pos > -1 && this.player_name_identified == false) {    
	  this.player_name = args[0].substring(0, pos);
	  this.player_name_identified = true;
log("-----------------");
log("-----------------");
log("-----------------");
log(this.player_name);
log("-----------------");
log("-----------------");
log("-----------------");

        }

        log(...args);
     }
   }

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
                                        if (!ioq3.canvas) {
                                                // ignore if the canvas hasn't yet initialized
                                                return;
                                        }
                                        if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
                                                                document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
                                                                document['fullScreenElement'] || document['fullscreenElement'])) {
                                                // ignore resize events due to going fullscreen
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

console.log("Add resize viewport listener");
                                window.addEventListener('resize', resizeViewport);
console.log("done resize viewport...");

                                // merge default args with query string args
                                //var args = ['+set', 'fs_cdn', 'content.quakejs.com:80', '+set', 'sv_master1', 'master.quakejs.com:27950']; //original args to list the servers from master.quakejs.com
                                //var args = ['+set', 'fs_cdn', 'content.quakejs.com:80', '+set', 'sv_master1', 'master.quakejs.com:27950', '+connect', 'YOUR_SERVER_HERE:27960']; //additional +connect arguement to connect to a specific server
                                var args = ['+set', 'fs_cdn', '18.163.184.251:80', '+connect', '18.163.184.251:27960']; //custom args list targeting a local content server and local game server both at the address 'quakejs'
                                args.push.apply(args, getQueryCommands());
                                ioq3.callMain(args);


  }



}
module.exports = Quake3;

