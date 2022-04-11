// @ts-nocheck

import screenfull from "screenfull";
import html2canvas from "html2canvas";

class Browser {
  public app: any;
  public browser_active: any;
  public drag_callback: any;
  public urlParams: any;
  public active_tab: any;
  public files: any;
  public returnIdentifier: any;
  public active_module: any;
  public host: any;
  public port: any;
  public protocol: any;

  constructor(app) {
    this.app = app || {};

    this.browser_active = 0;
    this.drag_callback = null;
    this.urlParams = {};
    this.active_module = "";
    this.host = "";
    this.port = "";
    this.protocol = "";

    //
    // tells us the browser window is visible, as opposed to
    // browser_active which is used to figure out which applications
    // users are interacting with in the browser.
    //
    this.active_tab = 0;
  }

  async initialize(app) {
    if (this.app.BROWSER != 1) {
      return 0;
    }

    try {
      if (!document.hidden) {
        this.setActiveTab(1);
      }

      //
      // Ralph took the conch from where it lay on the polished seat and held it
      // to his lips; but then he hesitated and did not blow. He held the shell
      // up instead and showed it to them and they understood.
      //
      try {
        const channel = new BroadcastChannel("saito");
        if (!document.hidden) {
          channel.postMessage({
            active: 1,
            publickey: this.app.wallet.returnPublicKey(),
          });
        }

        channel.onmessage = (e) => {
          if (!document.hidden) {
            channel.postMessage({
              active: 1,
              publickey: this.app.wallet.returnPublicKey(),
            });
            this.setActiveTab(1);
          } else {
            //
            // only disable if someone else active w/ same key
            //
            if (e.data) {
              if (e.data.active == 1) {
                if (e.data.active == 1 && e.data.publickey === this.app.wallet.returnPublicKey()) {
                  this.setActiveTab(0);
                }
              }
            }
          }
        };

        document.addEventListener(
          "visibilitychange",
          () => {
            if (document.hidden) {
              channel.postMessage({
                active: 0,
                publickey: this.app.wallet.returnPublicKey(),
              });
            } else {
              this.setActiveTab(1);
              channel.postMessage({
                active: 1,
                publickey: this.app.wallet.returnPublicKey(),
              });
            }
          },
          false
        );

        window.addEventListener("storage", (e) => {
          if (this.active_tab == 0) {
            this.app.storage.loadOptions();
          }
        });
      } catch (err) {
        console.error(err);
      }

      //
      // try and figure out what module is running
      // This code will error in a node.js environment - that's ok.
      // Abercrombie's rule.
      //
      if (typeof window == "undefined") {
        console.log("Initializing Saito Node");
        return;
      } else {
        console.info("Initializing Saito Light Client");
      }
      const current_url = window.location.toString();
      const myurl = new URL(current_url);
      this.host = myurl.host;
      this.port = myurl.port;
      this.protocol = myurl.protocol;
      const myurlpath = myurl.pathname.split("/");
      let active_module = myurlpath[1] ? myurlpath[1].toLowerCase() : "";
      if (active_module == "") { active_module = "website"; }
      this.active_module = active_module;

      //
      // query strings
      //
      this.urlParams = new URLSearchParams(window.location.search);
      const entries = this.urlParams.entries();
      for (const pair of entries) {
        //
        // if crypto is provided switch over
        //
        if (pair[0] === "crypto") {
          let preferred_crypto_found = 0;
          const available_cryptos = this.app.wallet.returnInstalledCryptos();
          for (let i = 0; i < available_cryptos.length; i++) {
            if (available_cryptos[i].ticker) {
              if (available_cryptos[i].ticker.toLowerCase() === pair[1].toLowerCase()) {
                preferred_crypto_found = 1;
                this.app.wallet.setPreferredCrypto(available_cryptos[i].ticker);
              }
            }
          }

          if (preferred_crypto_found == 0) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            salert(
              `Your compile does not contain a ${pair[1].toUpperCase()} module. Visit the AppStore or contact us about getting one built!`
            );
          }
        }
      }

      //
      // tell that module it is active
      //
      for (let i = 0; i < this.app.modules.mods.length; i++) {
        if (this.app.modules.mods[i].returnSlug() == active_module) {
          this.app.modules.mods[i].browser_active = 1;
          this.app.modules.mods[i].alerts = 0;

          //
          // if urlParams exist, hand them to the module
          //
          const urlParams = new URLSearchParams(location.search);

          this.app.modules.mods[i].handleUrlParams(urlParams);
        }
      }

      //
      // check if we are already open in another tab -
      // gracefully return out after warning user.
      //
      this.checkForMultipleWindows();
      //this.isFirstVisit();

      //if ('serviceWorker' in navigator) {
      //    await navigator.serviceWorker
      //        .register('/sw.js');
      //}

      this.browser_active = 1;
    } catch (err) {
      if (err == "ReferenceError: document is not defined") {
        console.log("non-browser detected: " + err);
      } else {
        throw err;
      }
    }

    if (this.app.BROWSER == 1) {
      //
      // Add Connection Monitors
      //
      this.app.connection.on("connection_up", function (peer) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        siteMessage("Websocket Connection Established", 1000);
      });
      this.app.connection.on("connection_down", function (peer) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        siteMessage("Websocket Connection Lost");
      });
    }


  }



  returnURLParameter(name) {
    try {
      this.urlParams = new URLSearchParams(window.location.search);
      const entries = this.urlParams.entries();
      for (const pair of entries) {
        if (pair[0] == name) {
          return pair[1];
        }
      }
    } catch (err) {
      console.log("error in urlparams: " + err);
    }
    return "";
  }

  isMobileBrowser(user_agent) {
    let check = false;
    (function (user_agent) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          user_agent
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          user_agent.substr(0, 4)
        )
      )
        check = true;
    })(user_agent);
    return check;
  }

  isSupportedBrowser(userAgent) {
    //
    // no to Safari
    //
    if (userAgent.toLowerCase().indexOf("safari/") > -1) {
      if (
        userAgent.toLowerCase().indexOf("chrome") == -1 &&
        userAgent.toLowerCase().indexOf("firefox") == -1
      ) {
        return 0;
      }
    }

    //
    // require ES6
    //
    try {
      Function("() => {};");
    } catch (err) {
      return 0;
    }

    return 1;
  }

  async sendNotification(title, message, event) {
    /***
        if (this.app.BROWSER == 0) {
            return;
        }

        if (!this.isMobileBrowser(navigator.userAgent)) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
            if (Notification.permission === 'granted') {
                notify = new Notification(title, {
                    body: message,
                    iconURL: "/saito/img/touch/pwa-192x192.png",
                    icon: "/saito/img/touch/pwa-192x192.png"
                });
            }
        } else {
            Notification.requestPermission()
                .then(function (result) {
                    if (result === 'granted' || result === 'default') {
                        navigator.serviceWorker.ready.then(function (registration) {
                            registration.showNotification(title, {
                                body: message,
                                icon: '/saito/img/touch/pwa-192x192.png',
                                vibrate: [200, 100, 200, 100, 200, 100, 200],
                                tag: event
                            });
                        });
                    }
                });
        }
***/
  }

  checkForMultipleWindows() {
    //Add a check to local storage that we are open in a tab.
    localStorage.openpages = Date.now();

    const onLocalStorageEvent = (e) => {
      if (e.key == "openpages") {
        // Listen if anybody else opening the same page!
        localStorage.page_available = Date.now();
      }
      if (e.key == "page_available" && !this.isMobileBrowser(navigator.userAgent)) {
        console.log(e.key);
        console.log(navigator.userAgent);
        //alert("One more page already open");
        //window.location.href = "/tabs.html";
      }
    };
    window.addEventListener("storage", onLocalStorageEvent, false);
  }

  returnInviteObject(email = "") {
    //
    // this informaton is in the email link provided by the user
    // to their friends.
    //
    const obj = {};
    obj.publickey = this.app.wallet.returnPublicKey();
    obj.bundle = "";
    obj.email = email;
    if (this.app.options.bundle != "") {
      obj.bundle = this.app.options.bundle;
    }

    return obj;
  }

  //
  // toggle active tab and disable / enable core blockchain
  // functionality as needed.
  //
  setActiveTab(active) {
    this.active_tab = active;
    this.app.blockchain.process_blocks = active;
    this.app.storage.save_options = active;
    for (let i = 0; i < this.app.network.peers.length; i++) {
      this.app.network.peers[i].handle_peer_requests = active;
    }
  }

  //////////////////////////////////
  // Browser and Helper Functions //
  //////////////////////////////////

  // https://github.com/sindresorhus/screenfull.js
  requestFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }

  addElementToDom(html, id = null) {
    const el = document.createElement("div");
    if (id == null) {
      document.body.appendChild(el);
    } else {
      if (!document.getElementById(id)) {
        document.body.appendChild(el);
      } else {
        document.getElementById(id).appendChild(el);
      }
    }
    el.outerHTML = html;
  }

  prependElementToDom(html, elemWhere = document.body) {
    try {
      const elem = document.createElement("div");
      elemWhere.insertAdjacentElement("afterbegin", elem);
      elem.outerHTML = html;
    } catch (err) {
      console.log("ERROR 582343: error in prependElementToDom");
    }
  }

  addElementToElement(html, elem = document.body) {
    try {
      const el = document.createElement("div");
      elem.appendChild(el);
      el.outerHTML = html;
    } catch (err) {
      console.log("ERROR 582343: error in addElementToElement");
    }
  }

  makeElement(elemType, elemId, elemClass) {
    const headerDiv = document.createElement(elemType);
    headerDiv.id = elemId;
    headerDiv.classList.add(elemClass);
    return headerDiv;
  }

  htmlToElement(domstring) {
    const html = new DOMParser().parseFromString(domstring, "text/html");
    return html.body.firstChild;
  }

  addToolTip(elem, text) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("tip");
    elem.replaceWith(wrapper);
    const tip = document.createElement("div");
    tip.classList.add("tiptext");
    tip.innerHTML = text;
    wrapper.append(elem);
    wrapper.append(tip);
  }

  formatDate(timestamp) {
    const datetime = new Date(timestamp);
    const hours = datetime.getHours();
    let minutes = datetime.getMinutes();
    const months = [12];
    months[0] = "January";
    months[1] = "February";
    months[2] = "March";
    months[3] = "April";
    months[4] = "May";
    months[5] = "June";
    months[6] = "July";
    months[7] = "August";
    months[8] = "September";
    months[9] = "October";
    months[10] = "November";
    months[11] = "December";
    const month = months[datetime.getMonth()];

    const day = datetime.getDay();
    const year = datetime.getFullYear();

    minutes = minutes.toString().length == 1 ? `0${minutes}` : `${minutes}`;
    return { year, month, day, hours, minutes };
  }

  addDragAndDropFileUploadToElement(id, handleFileDrop = null, click_to_upload = true) {
    const hidden_upload_form = `
      <form class="my-form" style="display:none">
        <p>Upload multiple files with the file dialog or by dragging and dropping images onto the dashed region</p>
        <input type="file" id="hidden_file_element_${id}" multiple accept="*">
        <label class="button" for="fileElem">Select some files</label>
      </form>
    `;

    if (!document.getElementById(`hidden_file_element_${id}`)) {
      this.addElementToDom(hidden_upload_form, id);
      const dropArea = document.getElementById(id);
      if (!dropArea) {
        console.error("Undefined id in browser", id);
        return null;
      }
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(eventName, this.preventDefaults, false);
      });
      ["dragenter", "dragover"].forEach((eventName) => {
        dropArea.addEventListener(eventName, this.highlight, false);
      });
      ["dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(eventName, this.unhighlight, false);
      });
      dropArea.addEventListener(
        "drop",
        function (e) {
          const dt = e.dataTransfer;
          const files = dt.files;
          [...files].forEach(function (file) {
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
              handleFileDrop(event.target.result);
            });
            reader.readAsDataURL(file);
          });
        },
        false
      );
      dropArea.parentNode.parentNode.addEventListener(
        "paste",
        function (e) {
          const files = e.clipboardData.files;
          [...files].forEach(function (file) {
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
              handleFileDrop(event.target.result);
            });
            reader.readAsDataURL(file);
          });
        },
        false
      );
      const input = document.getElementById(`hidden_file_element_${id}`);
      if (click_to_upload == true) {
        dropArea.addEventListener("click", function (e) {
          input.click();
        });
      }

      input.addEventListener(
        "change",
        function (e) {
          const fileName = "";
          if (this.files && this.files.length > 0) {
            const files = this.files;
            [...files].forEach(function (file) {
              const reader = new FileReader();
              reader.addEventListener("load", (event) => {
                handleFileDrop(event.target.result);
              });
              reader.readAsDataURL(file);
            });
          }
        },
        false
      );
      dropArea.focus();
    }
  }

  highlight(e) {
    document.getElementById(e.currentTarget.id).style.opacity = 0.8;
  }

  unhighlight(e) {
    document.getElementById(e.currentTarget.id).style.opacity = 1;
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  makeDraggable(id_to_move, id_to_drag = "", mycallback = null) {
    try {
      const element_to_move = document.getElementById(id_to_move);
      let element_to_drag = element_to_move;
      if (id_to_drag) {
        element_to_drag = document.getElementById(id_to_drag);
      }

      let element_moved = 0;

      let mouse_down_left = 0;
      let mouse_down_top = 0;
      let mouse_current_left = 0;
      let mouse_current_top = 0;
      let element_start_left = 0;
      let element_start_top = 0;

      element_to_drag.onmousedown = function (e) {
        e = e || window.event;

        if (
          !e.currentTarget.id ||
          (e.currentTarget.id != id_to_move && e.currentTarget.id != id_to_drag)
        ) {
          document.onmouseup = null;
          document.onmousemove = null;
          return;
        }

        element_to_move.style.transition = "unset";

        const rect = element_to_move.getBoundingClientRect();
        element_start_left = rect.left;
        element_start_top = rect.top;

        mouse_down_left = e.clientX;
        mouse_down_top = e.clientY;

        element_moved = false;
        //console.log("Element Start Left: " + element_start_left);
        //console.log("Element Start Top: " + element_start_top);
        //console.log("Mouse Down Left: " + mouse_down_left);
        //console.log("Mouse Down Top: " + mouse_down_top);

        document.onmouseup = function (e) {
          document.onmouseup = null;
          document.onmousemove = null;

          element_to_move.style.transition = "";
          if (mycallback && element_moved) {
            mycallback();
          }
        };

        document.onmousemove = function (e) {
          e = e || window.event;
          e.preventDefault();

          mouse_current_left = e.clientX;
          mouse_current_top = e.clientY;
          const adjustmentX = mouse_current_left - mouse_down_left;
          const adjustmentY = mouse_current_top - mouse_down_top;

          if (adjustmentX !== 0 || adjustmentY !== 0) {
            element_moved = true;
          }

          // set the element's new position:
          element_to_move.style.left = element_start_left + adjustmentX + "px";
          element_to_move.style.top = element_start_top + adjustmentY + "px";

          //We are changing to Top/Left so get rid of bottom/right
          element_to_move.style.bottom = "unset";
          element_to_move.style.right = "unset";
          //Styles that adjust where the element goes, need to go away!
          element_to_move.style.transform = "unset";
          element_to_move.style.marginTop = "unset";
          element_to_move.style.marginLeft = "unset";
        };

        return false;
      };

      element_to_drag.ontouchstart = function (e) {
        e = e || window.event;

        if (
          !e.currentTarget.id ||
          (e.currentTarget.id != id_to_move && e.currentTarget.id != id_to_drag)
        ) {
          document.ontouchend = null;
          document.ontouchmove = null;
          return;
        }

        element_to_move.style.transition = "unset";

        //e.preventDefault();
        //if (e.stopPropagation) { e.stopPropagation(); }
        //if (e.preventDefault) { e.preventDefault(); }
        //e.cancelBubble = true;
        //e.returnValue = false;

        const rect = element_to_move.getBoundingClientRect();
        element_start_left = rect.left;
        element_start_top = rect.top;
        mouse_down_left = e.targetTouches[0]
          ? e.targetTouches[0].pageX
          : e.changedTouches[e.changedTouches.length - 1].pageX;
        mouse_down_top = e.targetTouches[0]
          ? event.targetTouches[0].pageY
          : e.changedTouches[e.changedTouches.length - 1].pageY;
        mouse_current_left = mouse_down_left;
        mouse_current_top = mouse_down_top;

        document.ontouchend = function (e) {
          document.ontouchend = null;
          document.ontouchmove = null;
          if (mycallback && element_moved) {
            mycallback();
          }
        };

        document.ontouchmove = function (e) {
          e = e || window.event;
          //e.preventDefault();

          mouse_current_left = e.targetTouches[0]
            ? e.targetTouches[0].pageX
            : e.changedTouches[e.changedTouches.length - 1].pageX;
          mouse_current_top = e.targetTouches[0]
            ? event.targetTouches[0].pageY
            : e.changedTouches[e.changedTouches.length - 1].pageY;
          const adjustmentX = mouse_current_left - mouse_down_left;
          const adjustmentY = mouse_current_top - mouse_down_top;

          if (adjustmentX !== 0 || adjustmentY !== 0) {
            element_moved = true;
          }

          // set the element's new position:
          element_to_move.style.left = element_start_left + adjustmentX + "px";
          element_to_move.style.top = element_start_top + adjustmentY + "px";
          element_to_move.style.bottom = "unset";
          element_to_move.style.right = "unset";
          element_to_move.style.transform = "unset";
          element_to_move.style.marginTop = "unset";
          element_to_move.style.marginLeft = "unset";
        };
      };
    } catch (err) {
      console.error("error: " + err);
      console.log(element_to_move, element_to_drag);
    }
  }

  /**
   * Fetchs identifiers from a set of keys
   *
   * @param {Array} keys
   */
  async addIdentifiersToDom(keys = []) {
    if (keys.length == 0) {
      const addresses = document.getElementsByClassName(`saito-address`);
      Array.from(addresses).forEach((add) => {
        const pubkey = add.getAttribute("data-id");
        if (pubkey) {
          keys.push(pubkey);
        }
      });
    }

    try {
      const answer = await this.app.keys.fetchManyIdentifiersPromise(keys);
      Object.entries(answer).forEach(([key, value]) => this.updateAddressHTML(key, value));
    } catch (err) {
      console.error(err);
    }
  }

  returnAddressHTML(key) {
    const identifier = this.app.keys.returnIdentifierByPublicKey(key);
    const id = !identifier ? key : identifier;
    return `<span data-id="${key}" class="saito-address saito-address-${key}">${id}</span>`;
  }

  async returnAddressHTMLPromise(key) {
    const identifier = await this.returnIdentifier(key);
    const id = !identifier ? key : identifier;
    return `<span class="saito-address saito-address-${key}">${id}</span>`;
  }

  updateAddressHTML(key, id) {
    if (!id) {
      return;
    }
    try {
      const addresses = document.getElementsByClassName(`saito-address-${key}`);
      Array.from(addresses).forEach((add) => (add.innerHTML = id));
    } catch (err) {}
  }

  logMatomoEvent(category, action, name, value) {
    try {
      this.app.modules
        .returnFirstRespondTo("matomo_event_push")
        .push(category, action, name, value);
    } catch (err) {
      if (err.startsWith("Module responding to")) {
        console.log("Matomo module not present, cannot push event");
      } else {
        console.log(err);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  /////////////////////// url-hash helper functions ////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  // TODO: Add a function which alphabetizes keys so that noop url changes will
  // always act correctly... .e.g. someFunction("#bar=1&foo=2") should never
  // return "#foo=1&bar=2". Some other way of preserving order may be better...
  //////////////////////////////////////////////////////////////////////////////
  //
  // Parse a url-hash string into an object.
  // usage: parseHash("#foo=1&bar=2") --> {foo: 1, bar: 2}
  parseHash(hash) {
    if (hash === "") {
      return {};
    }
    return hash
      .substr(1)
      .split("&")
      .reduce(function (result, item) {
        const parts = item.split("=");
        result[parts[0]] = parts[1];
        return result;
      }, {});
  }

  // Build a url-hash string from an object.
  // usage: buildHash({foo: 1, bar: 2}) --> "#foo=1&bar=2"
  buildHash(hashObj) {
    const hashString = Object.keys(hashObj).reduce((output, key) => {
      const val = hashObj[key];
      return output + `&${key}=${hashObj[key]}`;
    }, "");
    return "#" + hashString.substr(1);
  }

  // Make a new hash and mix in keys from another hash.
  // usage: buildHashAndPreserve("#foo=1&bar=2","#foo=3&bar=4&baz=5","baz") --> "#foo=1&bar=2&baz=5"
  buildHashAndPreserve(newHash, oldHash, ...preservedKeys) {
    return this.buildHash(
      Object.assign(this.getSubsetOfHash(oldHash, preservedKeys), this.parseHash(newHash))
    );
  }

  // Get a subset of key-value pairs from a url-hash string as an object.
  // usage: getSubsetOfHash("#foo=1&bar=2","bar") --> {bar: 2}
  getSubsetOfHash(hash, ...keys) {
    const hashObj = this.parseHash(hash);
    return keys.reduce(function (o, k) {
      o[k] = hashObj[k];
      return o;
    }, {});
  }

  // Remove a subset of key-value pairs from a url-hash string.
  // usage: removeFromHash("#foo=1&bar=2","bar") --> "#foo=1"
  removeFromHash(hash, ...keys) {
    const hashObj = this.parseHash(hash);
    keys.forEach((key, i) => {
      delete hashObj[key];
    });
    return this.buildHash(hashObj);
  }

  // Add new key-value pairs to the hash.
  // usage: modifyHash("#foo=1",{bar: 2}) --> "#foo=1&bar=2"
  modifyHash(oldHash, newHashValues) {
    return this.buildHash(Object.assign(this.parseHash(oldHash), newHashValues));
  }

  // Override defaults with other values. Useful to initialize a page.
  // usage: modifyHash("#foo=1&bar=2","#foo=3") --> "#foo=3&bar=2"
  defaultHashTo(defaultHash, newHash) {
    return this.buildHash(Object.assign(this.parseHash(defaultHash), this.parseHash(newHash)));
  }

  // Initialize a hash on page load.
  // Typically some values need a setting but can be overridden by a "deep link".
  // Other values must take certain values on page load, e.g. ready=false these
  // go in the forcedHashValues
  //
  // usage:
  // let currentHash = window.location.hash; // (e.g."#page=2&ready=1")
  // initializeHash("#page=1", currentHash, {ready: 0}) --> #page=2&ready=0
  initializeHash(defaultHash, deepLinkHash, forcedHashValues) {
    return this.modifyHash(this.defaultHashTo(defaultHash, deepLinkHash), forcedHashValues);
  }

  // TODO: implement htis function
  getValueFromHashAsBoolean() {}

  getValueFromHashAsNumber(hash, key) {
    try {
      const subsetHashObj = this.getSubsetOfHash(hash, key);
      if (subsetHashObj[key]) {
        return Number(subsetHashObj[key]);
      } else {
        throw "key not found in hash";
      }
    } catch (err) {
      return Number(0);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  /////////////////////// end url-hash helper functions ////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  async captureScreenshot(callback = null) {
    html2canvas(document.body).then(function (canvas) {
      let img = canvas.toDataURL("image/jpeg", 0.35);
      console.log("img: " + img);
      if (callback != null) {
        callback(img);
      }
    });
  }
}

export default Browser;
