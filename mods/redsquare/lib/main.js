const RedSquareMainTemplate = require("./main.template");
const RedSquareAppspaceProfile = require("./appspace/profile");
const RedSquareAppspaceHome = require("./appspace/home");
const RedSquareAppspaceNotifications = require("./appspace/notifications");
const RedSquareAppspaceGames = require("./appspace/games");
const RedSquareAppspaceContacts = require("./appspace/contacts");
const SaitoLoader = require("../../../lib/saito/ui/saito-loader/saito-loader");

class RedSquareMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareMain";

    this.callbacks = {};

    this.components = {};
    this.components['home'] = new RedSquareAppspaceHome(app, mod, ".saito-main");
    this.components['profile'] = new RedSquareAppspaceProfile(app, mod, ".saito-main");
    this.components['notifications'] = new RedSquareAppspaceNotifications(app, mod, ".saito-main");
    //this.components['contacts'] = new RedSquareAppspaceContacts(app, mod, ".saito-main");
    this.render_component = 'home';


    //
    // EVENTS
    //
    // redsquare - component - ui-component - [render-method] - (render-request)
    //
    this.app.connection.on("redsquare-home-render-request", () => {
      this.renderAppspaceComponent("home");
      this.components["home"].renderTweets();
      this.app.browser.addIdentifiersToDom();
    });
    this.app.connection.on("redsquare-home-loader-render-request", () => {
      this.components["home"].loader.render();
    });
    this.app.connection.on("redsquare-home-loader-hide-request", () => {
      this.components["home"].loader.hide();
    });
    this.app.connection.on("redsquare-home-thread-render-request", (tweets) => {
      this.renderAppspaceComponent("home");
      this.components["home"].renderThread(tweets);
      this.app.browser.addIdentifiersToDom();
    });
    this.app.connection.on("redsquare-home-tweet-render-request", (tweet) => {
      this.renderAppspaceComponent("home");
      this.components["home"].appendTweet(tweet);
      this.app.browser.addIdentifiersToDom();
    });
    this.app.connection.on("redsquare-home-tweet-append-render-request", (tweet) => {
      this.components["home"].appendTweet(tweet);
      this.app.browser.addIdentifiersToDom();
    });
    this.app.connection.on("redsquare-home-tweet-prepend-render-request", (tweet) => {
      this.components["home"].prependTweet(tweet);
      this.app.browser.addIdentifiersToDom();
    });
    this.app.connection.on("redsquare-home-tweet-and-critical-child-append-render-request", (tweet) => {
      this.components["home"].prependTweetWithCriticalChild(tweet);
      this.app.browser.addIdentifiersToDom();
    });
    this.app.connection.on("redsquare-home-tweet-and-critical-child-prepend-render-request", (tweet) => {
      this.components["home"].prependTweetWithCriticalChild(tweet);
      this.app.browser.addIdentifiersToDom();
    });
    this.app.connection.on("redsquare-tweet-added-render-request", (tweet) => {
      if (this.render_component === "home") {
        if (tweet.updated_at < this.mod.tweets_last_viewed_ts) {
          this.app.connection.emit("redsquare-home-tweet-append-render-request", (tweet));
        } else {
          if (tweet.tx.transaction.from[0].add === this.app.wallet.returnPublicKey()) {
            this.app.connection.emit("redsquare-home-tweet-prepend-render-request", (tweet));
          }
        }
      }
      this.app.browser.addIdentifiersToDom();
    });
    this.app.connection.on("redsquare-profile-render-request", () => {
      this.renderAppspaceComponent("profile");
    });
    //this.app.connection.on("redsquare-contacts-render-request", () => {
    //  this.renderAppspaceComponent("contacts");
    //});
    this.app.connection.on("redsquare-notifications-render-request", () => {
      this.renderAppspaceComponent("notifications");
      this.components["notifications"].renderNotifications();
    });

    this.app.connection.on("redsquare-component-render-request", (obj) => {

      let hash = obj.hash;
      let params = obj.params;

      if (hash) {
        if (this.components[hash]) {
          this.render_component = hash;
          document.querySelector(".saito-main").innerHTML = "";
          this.components[this.render_component].render();
        } else {
          this.app.modules.returnModulesRenderingInto(".saito-main").forEach((mod) => {
            if (mod.returnSlug() === hash) {
              document.querySelector(".saito-main").innerHTML = "";
              mod.renderInto(".saito-main");
              document.querySelector('.saito-container').scroll({ top: 0, left: 0, behavior: 'smooth' });
              if (mod.canRenderInto(".saito-sidebar.right")) {
                document.querySelector(".saito-sidebar.right").innerHTML = "";
                mod.renderInto(".saito-sidebar.right");
              }
            }
          });
        }
      }
    });

  }


  renderAppspaceComponent(component) {
    document.querySelector(".saito-main").innerHTML = "";
    this.mod.viewing = component;
    this.render_component = component;
    this.components[this.render_component].render();
    document.querySelector(".saito-sidebar.right").innerHTML = "";
    this.mod.sidebar.render();
  }

  render() {
    this_main = this;
    //
    // render framework for app
    //
    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(RedSquareMainTemplate(), ".saito-container");
    } else {
      this.app.browser.addElementToSelectorOrDom(RedSquareMainTemplate(), this.container);
    }


    let mods = this.app.modules.respondTo("saito-floating-menu");

    let index = 0;
    let menu_entries = [];
    mods.forEach((mod) => {
      let item = this.mod.respondTo('saito-floating-menu');
      if (item instanceof Array) {
        item.forEach(j => {
          if (!j.rank) { j.rank = 100; }
          menu_entries.push(j);
        });
      }
    });

    let menu_sort = function (a, b) {
      if (a.rank < b.rank) { return -1; }
      if (a.rank > b.rank) { return 1; }
      return 0;
    }
    menu_entries = menu_entries.sort(menu_sort);

    for (let i = 0; i < menu_entries.length; i++) {
      let j = menu_entries[i];
      let show_me = true;
      let active_mod = this.app.modules.returnActiveModule();
      if (typeof j.disallowed_mods != 'undefined') { if (j.disallowed_mods.includes(active_mod.slug)) { show_me = false; } }
      if (typeof j.allowed_mods != 'undefined') {
        show_me = false;
        if (j.allowed_mods.includes(active_mod.slug)) { show_me = true; }
      }
      if (show_me) {
        let id = `saito_floating_menu_item_${index}`;
        this_main.callbacks[id] = j.callback;
        this_main.addMenuItem(j, id);
        index++;
      }
    }


    this.attachEvents();

  }


    addMenuItem(item, id) {

      let html = `
        <div id="${id}" data-id="${item.text}" class="minifab op5">
          <i class="${item.icon}"></i>
        </div>
      `;

      document.querySelector("#fab").innerHTML += html;
    }


  attachEvents() {
    this_menu = this;
    var scrollableElement = document.querySelector(".saito-container");
    var sidebar = document.querySelector(".saito-sidebar.right");
    var scrollTop = 0;
    var stop = 0;

    scrollableElement.addEventListener("scroll", (e) => {
      if (window.innerHeight - 150 < sidebar.clientHeight) {
        if (scrollTop < scrollableElement.scrollTop) {
          stop = window.innerHeight - sidebar.clientHeight + scrollableElement.scrollTop;
          if (scrollableElement.scrollTop + window.innerHeight > sidebar.clientHeight) {
            try {
              sidebar.style.top = stop + "px";
            } catch (err) {
              console.log("SIDEBAR ERROR 1");
            }
          }
        } else {
          if (stop > scrollableElement.scrollTop) {
            stop = scrollableElement.scrollTop;
            try {
              sidebar.style.top = stop + "px";
            } catch (err) {
              console.log("SIDEBAR ERROR 2");
            }
          }
        }
      } else {
        stop = scrollableElement.scrollTop;
        try {
          sidebar.style.top = stop + "px";
        } catch (err) {
          console.log("SIDEBAR ERROR 3");
        }
      }
      scrollTop = scrollableElement.scrollTop;
    });



    document.getElementById('fab').addEventListener('click', (e) => { 
      e.currentTarget.classList.toggle("activated");
    });


    document.querySelectorAll('.mini-fab').forEach(menu => {
      let id = menu.getAttribute("id");
      let data_id = menu.getAttribute("data-id");
      let callback = this_menu.callbacks[id];

      menu.addEventListener('click', (e) => {
        this.closeMenu();
        e.preventDefault();
        callback(app, data_id);
      });
    })

  }

}

module.exports = RedSquareMain;

