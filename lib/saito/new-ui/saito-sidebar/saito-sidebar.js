const SaitoSidebarTemplate = require("./saito-sidebar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");

//
// UIModTemplate
//
// The header derives from UIModTemplate -- this allows the component
// to be added to the list of modules that are actively running on Saito
// thus allowing them to receive transactions and update their UI just
// like any other modules.
//
// yes... you can send on-chain transactions to your sidebar if you feel
// a pressing need to communicate with it securely. Or ask it to listen
// to process whatever subset of transactions you need.
//
class SaitoSidebar extends UIModTemplate {

  constructor(app, mod = null, selector = "") {

    super(app);

    this.app = app;
    this.name = "SaitoSidebar UIComponent";
    this.align = "left";
    this.selector = selector;

    //
    // now initialize, since UI components are created
    // after all other modules have initialized, we need
    // to run any missed functions here in the constructor
    // in this case, initialize, as that is what processes
    // receiveEvent, etc.
    //
    this.initialize(app);

  }


  render(app, mod, selector = ".saito-container") {

    if (this.selector !== "" && (selector === "" || selector === ".saito-container")) { selector = this.selector; }

    if (!document.querySelector(`.saito-sidebar.${this.align}`)) {
      app.browser.addElementToSelector(SaitoSidebarTemplate(app, mod, this.align), selector);
    } else {
      app.browser.replaceElementBySelector(SaitoSidebarTemplate(app, mod, this.align), selector);
    }
    //
    // it renders its components into .saito-sidebar.${this.align}
    //
    super.render(app, mod, `.saito-sidebar.${this.align}`);

    this.attachEvents(app, mod)

  }

  attachEvents(app, mod){
      document.querySelector("#chat-icon").onclick = ()=> {
        for (let i = 0; i < app.modules.mods.length; i++) {
          if (app.modules.mods[i].slug === "chat" && app.modules.mods[i].gamesmenufilter === "chatx") {
            const chatx_mod = app.modules.mods[i];
            let community_chat_gid = chatx_mod.groups[0].id;
            document.querySelector(`.chat-manager-list .saito-user-${community_chat_gid}`).click();
          }
        }
         
      }

      document.body.addEventListener('click', e => {
         if(e.target.id=== "icon"){
          let element = document.querySelector('.redsquare-actions-container');
          let icon = document.querySelector('.saito-redsquare-actions-buttons-icon i')
          if(element.classList.contains("display-actions")){
            element.classList.remove('display-actions');
            icon.classList.remove('fa-minus')
            icon.classList.add('fa-plus')
          }else {
            element.classList.add('display-actions');
            icon.classList.remove('fa-plus')
            icon.classList.add('fa-minus')
          }
         }
       })
      
      

     
  }


}

module.exports = SaitoSidebar;

