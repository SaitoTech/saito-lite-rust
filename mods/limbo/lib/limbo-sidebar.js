const LimboSidebarTemplate = require('./limbo-sidebar.template');
const SaitoProfile = require('./../../../lib/saito/ui/saito-profile/saito-profile');
const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');


class LimboSidebar {
	constructor(app, mod, container = '.saito-sidebar.right') {
		this.app = app;
		this.mod = mod;
		this.container = container;

    this.profile = new SaitoProfile(app, mod, '.limbo-sidebar');
    this.profile.tab_container = ".limbo-sidebar .saito-modal-content";

    app.connection.on('limbo-dream-render', (dreamer = null) => {
      console.log('EVENT (Sidebar): limbo-dream-render', dreamer);
      this.render(dreamer);
    });

  }

	render(dreamer = null) {

    if (dreamer) {
      if (!document.getElementById("limbo-sidebar")){
        this.app.browser.addElementToSelector(LimboSidebarTemplate(this.app, this.mod, dreamer), this.container);
      }

      //
      // Need a way to override/customize profile of "dreamer" to profile of dream!
      //
      let dreamKey = this.mod.dreams[dreamer]?.alt_id || dreamer;

      if (dreamKey !== this.dreamer){
        this.profile.reset(dreamKey, "attendees", ["attendees", "speakers", "peers"]);

        if (this.mod.dreams[dreamer]?.alt_id) {
          this.profile.mask_key = true;
        }

        if (this.mod.dreams[dreamer]?.identifier){
          this.profile.name = this.mod.dreams[dreamer].identifier;
        }

        if (this.mod.dreams[dreamer]?.description){
          this.profile.description = this.mod.dreams[dreamer].description;
        }
      }else{
        this.profile.resetMenuTabs(["attendees", "speakers", "peers"]);
      }

      //
      // Build audience lists
      //

      for (let m of this.mod.dreams[dreamer].members){

        let name = m;
        if (m == this.app.keychain.returnIdentifierByPublicKey(m, true)) {
          name = '';
        }

        let user = new SaitoUser(this.app, this.mod, this.profile.tab_container, m, name)
        user.extra_classes = "saito-add-user-menu saito-contact";
        
        if (m == dreamer) {
          user.icon = `<i class="saito-overlaid-icon fa-solid fa-microphone-lines"></i>`;
          this.profile.menu.speakers.push(user);
        }else{
          this.profile.menu.attendees.push(user);  
        }
      }

      // Speakers are from videocall and not in the peer cast stream....
      if (this.mod.dreams[dreamer]?.speakers) {
        for (let m of this.mod.dreams[dreamer].speakers){ 
          let name = m;
          if (m == this.app.keychain.returnIdentifierByPublicKey(m, true)) {
            name = '';
          }

          let user = new SaitoUser(this.app, this.mod, ".limbo-sidebar .saito-modal-content", m, name)
          user.extra_classes = "saito-add-user-menu saito-contact";
          user.icon = `<i class="saito-overlaid-icon fa-solid fa-microphone-lines"></i>`;
          this.profile.menu.speakers.push(user);
        }
      }

      this.mod.upstream.forEach((value, key) => {
        let name = key;
        if (key == this.app.keychain.returnIdentifierByPublicKey(key, true)) {
          name = '';
        }
        let user = new SaitoUser(this.app, this.mod, ".limbo-sidebar .saito-modal-content", key, name)
        user.extra_classes = "saito-add-user-menu saito-contact";
        user.icon = `<i class="saito-overlaid-icon fa-solid fa-right-to-bracket"></i>`;
        this.profile.menu.peers.push(user);
      });

      this.mod.downstream.forEach((value, key) => {
        let name = key;
        if (key == this.app.keychain.returnIdentifierByPublicKey(key, true)) {
          name = '';
        }
        let user = new SaitoUser(this.app, this.mod, ".limbo-sidebar .saito-modal-content", key, name)
        user.extra_classes = "saito-add-user-menu saito-contact";
        user.icon = `<i class="saito-overlaid-icon fa-solid fa-right-from-bracket"></i>`;
        this.profile.menu.peers.push(user);
      });

      if (dreamKey !== this.dreamer){
        this.profile.render();      
        this.dreamer = dreamKey;
        this.attachEvents();      
      }else{
        this.profile.renderMenuTabs();
      }

    } else {
      if (document.getElementById("limbo-sidebar")){
        this.app.browser.replaceElementById(LimboSidebarTemplate(this.app, this.mod, dreamer), "limbo-sidebar");
      }else{
        this.app.browser.addElementToSelector(LimboSidebarTemplate(this.app, this.mod, dreamer), this.container);
      }
      this.profile.reset();
      this.actions_added = false;
      delete this.dreamer;
    }
  }


  attachEvents() { 
    //Dynamically add buttons to .saito-profile-menu

    if (!this?.actions_added){
      this.insertActions();
      this.actions_added = true;      
    }


    if (document.getElementById('share_link')){
      document.getElementById('share_link').onclick = (e) => {
        this.mod.copyInviteLink();
      }
    }

    let alt_button = document.getElementById("exit_space");
    if (alt_button){
      alt_button.onclick = async () => {
        let c = await sconfirm("Are you sure you want to leave?");

        if (!c) { return; }

        if (this.mod.dreamer == this.mod.publicKey){
          await this.mod.sendKickTransaction(); 
        }else{
          await this.mod.sendLeaveTransaction();  
        }
        
        this.mod.exitSpace();
      }
    }



  }


  insertActions(){

    // add call icons

    let container = document.querySelector("#limbo-sidebar .saito-profile-controls");

    if (!container) {
      return;
    }

    //
    // Add command functions 
    //
    
    let h1 = `<div id="share_link" class="saito-modal-menu-option">
                <i class="fa-solid fa-share-nodes"></i>
                <div>Share</div>
              </div>`;

    this.app.browser.addElementToSelector(h1, "#limbo-sidebar .saito-profile-controls");

    let h2 = `<div id="exit_space" class="saito-modal-menu-option">
                <i class="fa-solid fa-person-through-window"></i>
                <div>Exit</div>
              </div>`;

    this.app.browser.addElementToSelector(h2, "#limbo-sidebar .saito-profile-controls");


    let index = 0;

    for (const mod of this.app.modules.mods) {
      let item = mod.respondTo('limbo-actions', {
        group_name: this.mod.dreams[this.mod.dreamer]?.identifier || this.app.keychain.returnUsername(this.mod.dreamer) + "'s Space",
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

      if (item.event) {
        item.event(id);
      }

    }else{
      console.warn("Item not found");
    }

  } 




}
 
module.exports = LimboSidebar;
