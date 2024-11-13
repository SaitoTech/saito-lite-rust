
    if (card == "howilearned") {

      let twilight_self = this;

      if (player == "ussr") { this.game.state.milops_ussr = 5; }
      if (player == "us") { this.game.state.milops_us = 5; }

      let adjustDefcon = function(defcon_target){
        twilight_self.addMove("resolve\thowilearned");

        if (defcon_target > twilight_self.game.state.defcon) {
          let defcon_diff = defcon_target-twilight_self.game.state.defcon;
          for (let i = 0; i < defcon_diff; i++) {
            twilight_self.addMove("defcon\traise");
          }
        }

        if (defcon_target < twilight_self.game.state.defcon) {
          let defcon_diff = twilight_self.game.state.defcon - defcon_target;
          for (let i = 0; i < defcon_diff; i++) {
            twilight_self.addMove("defcon\tlower");
          }
        }
        twilight_self.endTurn();
      }

      this.startClockAndSetActivePlayer(this.roles.indexOf(player));

      if (i_played_the_card) {

      	//
      	// make DEFCON boxes clickable
      	//
        for (let i = 1; i <= 5; i ++){
          twilight_self.app.browser.addElementToDom(`<div id="${i}" class="set_defcon_box set_defcon_box_${i}"></div>`, document.getElementById("gameboard"));  
          $('.set_defcon_box_'+i).css('top', twilight_self.scale(twilight_self.game.state.defcon_ps[5-i].top)+"px");
          $('.set_defcon_box_'+i).css('left', twilight_self.scale(twilight_self.game.state.defcon_ps[5-i].left)+"px");

        }
      	
        $('.set_defcon_box').css('width', twilight_self.scale(120)+"px");
        $('.set_defcon_box').css('height', twilight_self.scale(120)+"px");
        $('.set_defcon_box').css('z-index', 1000);
        $('.set_defcon_box').css('background-color', 'yellow');
        $('.set_defcon_box').css('opacity', 0.5);
        $('.set_defcon_box').css('display', 'block');
        $('.set_defcon_box').css('position', 'absolute');
        
        
      	$('.set_defcon_box').off();
      	$('.set_defcon_box').on('click', async function(e) {

      	  let defcon_target = parseInt(e.currentTarget.id);
      	  let confirm_it = await sconfirm("Set DEFCON at "+defcon_target+"?");
      	  if (!confirm_it) { return; }
          adjustDefcon(defcon_target);
      	  $('.set_defcon_box').remove();

    	  });



      	//
      	// and handle with the HUD too
      	//
        twilight_self.updateStatusWithOptions('Set DEFCON to:','<ul><li class="option" id="5">five</li><li class="option" id="4">four</li><li class="option" id="3">three</li><li class="option" id="2">two</li><li class="option" id="1">one</li></ul></div>', function(action2) {
          adjustDefcon(parseInt(action2));
      	  $('.set_defcon_box').remove();

        });
      }
      return 0;
    }



