var SideMenu = /** @class */ (function () {
    function SideMenu(app) {
        this.shown = false;
    }
    SideMenu.prototype.render = function (app, mod) {
        if (!document.getElementById("modules-dropdown")) {
            var html_1 = "\n      <hr/>\n      <div id=\"modules-dropdown\" class=\"header-dropdown-links\">\n      ";
            app.modules.getRespondTos("header-dropdown").forEach(function (response, i) {
                html_1 += "<div class=\"wallet-action-row\"><a id=\"nav-".concat(response.name, "\" href=\"/").concat(response.slug, "\" class=\"wallet-action-nav-link\"><i class=\"settings-fas-icon ").concat(response.icon_fa, "\"></i> ").concat(response.name, "</a></div>");
            });
            html_1 += "</div><hr>";
            app.browser.addElementToDom(html_1, 'settings-dropdown');
            this.attachEvents(app, mod);
        }
        if (this.shown) {
            document.querySelector('#settings-dropdown').classList.add("show-right-sidebar");
        }
        else {
            document.querySelector('#settings-dropdown').classList.remove("show-right-sidebar");
        }
    };
    SideMenu.prototype.attachEvents = function (app, mod) {
        var _this = this;
        var showHideSideMenuCallback = function (e) {
            document.querySelectorAll(".wallet-action-row, #modules-dropdown a").forEach(function (elem, i) {
                if (elem === e.currentTarget) {
                    return;
                }
            });
            _this.shown = false;
            _this.render(app, mod);
        };
        window.removeEventListener('click', showHideSideMenuCallback);
        window.addEventListener('click', showHideSideMenuCallback);
        document.querySelectorAll(".wallet-action-row .wallet-action-nav-link").forEach(function (elem, i) {
            elem.onclick = function (e) {
                var navName = e.currentTarget.id.replace("nav-", "");
                app.browser.logMatomoEvent("Navigation", "HeaderDropdownNavigationClick", navName);
            };
        });
        document.querySelector('#settings-dropdown').addEventListener('click', function (event) {
            // dont' close the side menu if the user clicked within it... unless they clicked 
            event.cancelBubble = true;
        });
        document.querySelectorAll("#header-mini-wallet, #navigator").forEach(function (elem, i) {
            elem.onclick = function (event) {
                _this.shown = !_this.shown;
                // close chat-box if it's open
                if (_this.shown) {
                    var chatBox = document.querySelector(".chat-box-close");
                    if (chatBox) {
                        chatBox.click();
                    }
                }
                _this.render(app, mod);
                event.cancelBubble = true;
            };
        });
    };
    return SideMenu;
}());
module.exports = SideMenu;
//# sourceMappingURL=side-menu.js.map