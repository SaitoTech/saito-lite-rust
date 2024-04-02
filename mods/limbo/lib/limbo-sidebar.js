const LimboSidebarTemplate = require('./limbo-sidebar.template');


class LimboSidebar {
	constructor(app, mod, container = '.saito-sidebar.right') {
		this.app = app;
		this.mod = mod;
		this.container = container;

    app.connection.on('limbo-open-dream', (dreamer = null) => {
      console.log('limbo-open-dream', dreamer);
      this.render(dreamer);
    });

  }

	render(dreamer = null) {

    if (document.getElementById("limbo-sidebar")){
      this.app.browser.replaceElementById(LimboSidebarTemplate(this.app, this.mod, dreamer), "limbo-sidebar");
    }else{
      this.app.browser.addElementToSelector(LimboSidebarTemplate(this.app, this.mod, dreamer), this.container);
    }

    if (dreamer){
      this.attachEvents();      
    }
  }

  attachEvents() { 
    //Dynamically add buttons to .saito-profile-menu

    this.insertActions();

    if (document.getElementById('share_link')){
      document.getElementById('share_link').onclick = (e) => {
        this.mod.copyInviteLink();
      }
    }

    let alt_button = document.getElementById("exit_space");
    if (alt_button){
      alt_button.onclick = async () => {
        if (this.mod.dreamer == this.mod.publicKey){
          await this.mod.sendKickTransaction(); 
        }else{
          await this.mod.sendLeaveTransaction();  
        }
        
        this.mod.exitSpace();
      }
    }


    //<div id="dream-space-chat" class="saito-modal-menu-option"><i class="fa-solid "></i><div>Space Chat</div></div>

  }


  insertActions(){

    // add call icons

    let container = document.querySelector("#limbo-sidebar .saito-profile-menu");

    if (!container) {
      return;
    }

    let index = 0;

    for (const mod of this.app.modules.mods) {
      let item = mod.respondTo('limbo-actions', {
        group_name: this.app.keychain.returnUsername(this.mod.dreamer) + "'s dream",
        call_id: this.mod.dreamer + "dream",
      });
      if (item instanceof Array) {
        item.forEach((j) => {
          this.createActionItem(j, container, index++);
        });
      } else if (item != null) {
        this.createActionItem(item, container, index++);
      }
    }
  }


  createActionItem(item, container, index) {
    let id = "call_action_item_" + index;
    let html = `<div id="${id}" class="saito-modal-menu-option">
            <i class="${item.icon}"></i>
            <div>${item.text}</div>
          </div>`;

    const el = document.createElement('div');

    //if (item?.prepend){
      container.prepend(el);
    //}else{
    //  container.appendChild(el);
    //}
    
    el.outerHTML = html;

    let div = document.getElementById(id);
    if (div){
      if (item?.callback){
        div.onclick = () => {
          item.callback(this.app);
        };
      }else{
        console.warn("Adding an action item with no callback");
      }

    }else{
      console.warn("Item not found");
    }

  } 




}
 
module.exports = LimboSidebar;
