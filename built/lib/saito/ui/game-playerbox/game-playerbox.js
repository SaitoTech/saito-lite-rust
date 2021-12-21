var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var GamePlayerBoxTemplate = require('./game-playerbox.template');
/**
 * A Class to Make Playerboxes for displaying information about all the players in the game
 * Class converts Player numbers from game into user-oriented ids to distinguish this player from the opponents
 * For example, in a 2-player game each player's own playerbox will have -1 suffixed to all the div id's and the opponent's playerbox will have -4 as the suffix on each of the div ids
 * This player has a status class added by default
 *
 * Basic template:
 *   Name --- a Head for the Player's identicon and name
 *   Info --- a Div for Information (formatted to the players specification)
 *   Log --- a Div for Player log (to include additional information),
 *         this defaults to status for the player and is used by some games for interactive controls
 *   Graphic --- a Div for graphical elements, such a dealt hand of cards
 *
 *   Name is the only mandatory and pre-defined part of Player-Box
 *   You may insert whatever HTML you want into Info, Log, or Graphic.
 *   Info can be hidden/displayed independently of the Player-Box
 *   Graphic can be assigned classnames for more flexible display behavior (such as outside the player-box)
 */
var GamePlayerBox = /** @class */ (function () {
    /**
     *  @constructor
     *  @param app - Saito app
     */
    function GamePlayerBox(app) {
        this.app = app;
        this.game_mod = null;
    }
    /**
     * Creates player boxes according to number of players in game
     * Automatically assigns unique id #s to divs in DOM, but can be specified by setting a seats property in game object
     * @param app - Saito app
     * @param game_mod - the game object
    */
    GamePlayerBox.prototype.render = function (app, game_mod) {
        this.game_mod = game_mod;
        try {
            for (var i = 1; i <= game_mod.game.players.length; i++) {
                var player = this._playerBox(i);
                if (!document.getElementById("player-box-".concat(player))) {
                    //let isItMe = (this.returnPlayersBoxArray().indexOf(player) == 0); //Include status in box of the controlling player
                    var pBox = app.browser.htmlToElement(GamePlayerBoxTemplate(player));
                    if (document.querySelector(".main")) {
                        document.querySelector(".main").append(pBox);
                    }
                    else {
                        document.body.append(pBox);
                    }
                    this.refreshName(i); //Player names included in box by default
                }
                if (document.getElementById(("player-box-".concat(player)))) {
                    document.getElementById(("player-box-".concat(player))).style.display = "block";
                }
            }
        }
        catch (err) {
            console.log("Render error: ", err);
        }
    };
    /** Default event -- double click player-box head to launch chat window with player */
    GamePlayerBox.prototype.attachEvents = function (app, data) {
        if (data === void 0) { data = null; }
        var chatmod = null;
        var pb_self = this;
        for (var i = 0; i < this.app.modules.mods.length; i++) {
            if (this.app.modules.mods[i].slug === "chat") {
                chatmod = this.app.modules.mods[i];
            }
        }
        var _loop_1 = function (player) {
            var boxId = this_1._playerBox(player);
            $("#player-box-head-".concat(boxId)).off();
            if (pb_self.game_mod.game.players[player - 1] !== pb_self.app.wallet.returnPublicKey()) {
                $("#player-box-head-".concat(boxId)).on("dblclick", function () {
                    //Code to launch a private chat window
                    var members = [pb_self.game_mod.game.players[player - 1], pb_self.app.wallet.returnPublicKey()].sort();
                    var gid = pb_self.app.crypto.hash(members.join('_'));
                    var newgroup = chatmod.createChatGroup(members, "Player ".concat(player, ": ").concat(app.keys.returnUsername(pb_self.game_mod.game.players[player - 1])));
                    if (newgroup) {
                        chatmod.addNewGroup(newgroup);
                        chatmod.sendEvent('chat-render-request', {});
                        chatmod.saveChat();
                        chatmod.openChatBox(newgroup.id);
                    }
                    else {
                        chatmod.sendEvent('chat-render-request', {});
                        chatmod.openChatBox(gid);
                    }
                });
            }
        };
        var this_1 = this;
        for (var player = 1; player <= this.game_mod.game.players.length; player++) {
            _loop_1(player);
        }
    };
    /**
     * Adds draggability to all the playerboxes (not a default setting)
     */
    GamePlayerBox.prototype.makeDraggable = function () {
        try {
            var groupedOpponents = document.getElementById("opponentbox");
            for (var i = 1; i <= this.game_mod.game.players.length; i++) {
                var player = this._playerBox(i);
                if (!document.getElementById("player-box-".concat(player)) || !document.getElementById("player-box-head-".concat(player))) {
                    console.log("Null DOM elements for Playerbox");
                    return -1;
                }
                if (i == this.game_mod.game.player || !groupedOpponents) {
                    this.app.browser.makeDraggable("player-box-".concat(player), "player-box-head-".concat(player));
                    document.querySelector("#player-box-head-".concat(player)).style.cursor = "grab";
                }
            }
            if (groupedOpponents) {
                this.app.browser.makeDraggable("opponentbox");
            }
        }
        catch (err) {
            console.log("Events error:", err);
        }
    };
    /**  Hide all Player-boxes  */
    GamePlayerBox.prototype.hide = function () {
        try {
            for (var i = 1; i <= this.game_mod.game.players.length; i++) {
                var player = this._playerBox(i);
                if (document.getElementById(("player-box-".concat(player)))) {
                    document.getElementById(("player-box-".concat(player))).style.display = "none";
                }
            }
        }
        catch (err) {
        }
    };
    /** Show all playerboxes */
    GamePlayerBox.prototype.show = function () {
        try {
            for (var i = 1; i <= this.game_mod.game.players.length; i++) {
                var player = this._playerBox(i);
                if (document.getElementById(("player-box-".concat(player)))) {
                    document.getElementById(("player-box-".concat(player))).style.display = "block";
                }
            }
        }
        catch (err) {
        }
    };
    /**
    * Groups all "opponent" playerboxes into a wrapper division
    */
    GamePlayerBox.prototype.groupOpponents = function () {
        var e_1, _a;
        var html = "<div class=\"opponents\" id=\"opponentbox\"></div>";
        var oBox = this.app.browser.htmlToElement(html);
        document.querySelector("#player-box-1").after(oBox); //Put new wrapper just after the player box 
        var opponents = this.returnPlayersBoxArray();
        opponents.shift(); //Remove the active player
        try {
            for (var opponents_1 = __values(opponents), opponents_1_1 = opponents_1.next(); !opponents_1_1.done; opponents_1_1 = opponents_1.next()) {
                var o = opponents_1_1.value;
                var pbo = document.querySelector("#player-box-".concat(o));
                var pbho = document.querySelector("#player-box-head-".concat(o));
                if (!pbo || !pbho) {
                    console.log("DOM failure");
                    return;
                }
                //Unset draggable (if activated)
                pbo.removeAttribute("style");
                pbho.removeAttribute("style");
                //Move Opponent Playerbox into container
                oBox.append(pbo);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (opponents_1_1 && !opponents_1_1.done && (_a = opponents_1.return)) _a.call(opponents_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        //Make them draggable as a unit
        //this.app.browser.makeDraggable("opponentbox");
    };
    /**
    * @param {int} pnum - player number, e.g. {1, 2, ... # of players}
    * Converts the player number to a "seat position" This player is always 1, unless you render with game.seats
    */
    GamePlayerBox.prototype._playerBox = function (pnum) {
        var player_box = this.returnPlayersBoxArray();
        if (pnum <= 0) {
            return player_box[0]; //Default is first position
        }
        //Shift players in Box Array according to whose browser, so that I am always in seat 1
        var prank = 1 + this.game_mod.game.players.indexOf(this.app.wallet.returnPublicKey()); //Equivalent to game_mod.player ?
        var seat = pnum - prank;
        if (seat < 0) {
            seat += this.game_mod.game.players.length;
        }
        return player_box[seat];
    };
    /**
    * Returns either game.seats or the default poker table seating schedule
    * 3 4 5
    * 2 1 6
    */
    GamePlayerBox.prototype.returnPlayersBoxArray = function () {
        var player_box = [];
        if (this.game_mod.seats) {
            player_box = this.game_mod.seats;
        }
        else {
            if (this.game_mod.game.players.length == 2) {
                player_box = [1, 4];
            }
            if (this.game_mod.game.players.length == 3) {
                player_box = [1, 3, 5];
            }
            if (this.game_mod.game.players.length == 4) {
                player_box = [1, 3, 4, 5];
            }
            if (this.game_mod.game.players.length == 5) {
                player_box = [1, 2, 3, 5, 6];
            }
            if (this.game_mod.game.players.length == 6) {
                player_box = [1, 2, 3, 4, 5, 6];
            }
        }
        return player_box;
    };
    /**
    * Returns poker table seating schedule for observer mode
    * 3 4 5
    * 2 _ 6
    */
    GamePlayerBox.prototype.returnViewBoxArray = function () {
        var player_box = [];
        if (this.game_mod.game.players.length == 2) {
            player_box = [3, 5];
        }
        if (this.game_mod.game.players.length == 3) {
            player_box = [3, 4, 5];
        }
        if (this.game_mod.game.players.length == 4) {
            player_box = [2, 3, 5, 6];
        }
        if (this.game_mod.game.players.length == 5) {
            player_box = [2, 3, 4, 5, 6];
        }
        return player_box;
    };
    /**
    * Adds a class to each of the playerboxes
    * @param {string} className - user defined class (for css or DOM hacking)
    * @param {boolean} isStub - flag for whether to add a numerical suffic to classname so you can tell apart playerboxes
    * This function [addClassAll("poker-seat")] is required for Player-Box to accurately render around a card table
    */
    GamePlayerBox.prototype.addClassAll = function (className, isStub) {
        var e_2, _a;
        if (isStub === void 0) { isStub = true; }
        if (isStub) {
            for (var i = 1; i <= 6; i++) {
                var box = document.querySelector("#player-box-".concat(i));
                if (box) {
                    box.classList.add("".concat(className).concat(i));
                }
            }
        }
        else {
            var boxes = document.querySelectorAll(".player_box");
            try {
                for (var boxes_1 = __values(boxes), boxes_1_1 = boxes_1.next(); !boxes_1_1.done; boxes_1_1 = boxes_1.next()) {
                    var box = boxes_1_1.value;
                    box.classList.add(className);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (boxes_1_1 && !boxes_1_1.done && (_a = boxes_1.return)) _a.call(boxes_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    };
    /**
     * Individually a classname to one of the playerboxes
     * @param {string} className - name of class
     * @param {int} player - the player number (according to game), -1 means this player
     */
    GamePlayerBox.prototype.addClass = function (className, player) {
        if (player === void 0) { player = -1; }
        var selector = "#player-box-" + this._playerBox(player);
        var box = document.querySelector(selector);
        if (box) {
            box.classList.add(className);
        }
    };
    /**
    * Add a class name to the "graphical" subdivision of each playerbox
    * @param {string} className - name of class
    */
    GamePlayerBox.prototype.addGraphicClass = function (className) {
        var e_3, _a;
        var playerBoxes = document.querySelectorAll(".player-box-graphic");
        try {
            for (var playerBoxes_1 = __values(playerBoxes), playerBoxes_1_1 = playerBoxes_1.next(); !playerBoxes_1_1.done; playerBoxes_1_1 = playerBoxes_1.next()) {
                var hand = playerBoxes_1_1.value;
                hand.classList.remove(className);
                hand.classList.add(className);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (playerBoxes_1_1 && !playerBoxes_1_1.done && (_a = playerBoxes_1.return)) _a.call(playerBoxes_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    /**
     * Adds a "status" class to player-box log of this player so that updateStatus functions
     * render in the playerbox
     */
    GamePlayerBox.prototype.addStatus = function () {
        var div = document.querySelector("#player-box-log-".concat(this._playerBox(-1)));
        if (div) {
            div.classList.add("status");
        }
    };
    /*
    * Helper class for updating different sections of Player-Box
    */
    GamePlayerBox.prototype._updateDiv = function (selector, html) {
        var div = document.querySelector(selector);
        if (div) {
            div.innerHTML = html;
        }
        else
            console.log(selector + " not found");
    };
    /**
     * Refresh Player Name (Player-Boxes show Identicon + Username in top line)
     * @param {int} pnum - the player number (according to game), -1 means this player
     * @param {string} name - a user-provided name. If blank, will use whatever name is associated with the wallet
    */
    GamePlayerBox.prototype.refreshName = function (pnum, name) {
        if (name === void 0) { name = ""; }
        var selector = "#player-box-head-" + this._playerBox(pnum);
        var identicon = "";
        if (name == "") {
            name = this.game_mod.game.players[pnum - 1];
            name = this.app.keys.returnUsername(name);
            identicon = this.app.keys.returnIdenticon(name);
            if (name != "") {
                if (name.indexOf("@") > 0) {
                    name = name.substring(0, name.indexOf("@"));
                }
            }
        }
        var html = (identicon) ? "<img class=\"player-identicon\" src=\"".concat(identicon, "\">") : "";
        html += "<div class=\"player-info-name\">".concat(name, "</div>");
        this._updateDiv(selector, html);
    };
    /**
    * Insert provided html into the graphic subdivision of playerbox
    * @param {string} html - information to be displayed
    * @param {int} pnum - the player number (according to game), -1 means this player
    */
    GamePlayerBox.prototype.refreshGraphic = function (html, pnum) {
        if (pnum === void 0) { pnum = -1; }
        this._updateDiv("#player-box-graphic-".concat(this._playerBox(pnum)), html);
    };
    /**
    * Insert provided html into the log subdivision of playerbox
    * @param {string} html - information to be displayed
    * @param {int} pnum - the player number (according to game), -1 means this player
    */
    GamePlayerBox.prototype.refreshLog = function (html, pnum) {
        if (pnum === void 0) { pnum = -1; }
        this._updateDiv("#player-box-log-".concat(this._playerBox(pnum)), html);
    };
    /**
    * Insert provided html into the log subdivision of playerbox
    * @param {string} html - information to be displayed
    * @param {int} pnum - the player number (according to game), -1 means this player
    */
    GamePlayerBox.prototype.refreshInfo = function (html, pnum) {
        if (pnum === void 0) { pnum = -1; }
        this._updateDiv("#player-box-info-".concat(this._playerBox(pnum)), html);
    };
    /**
    * Hide the info subdivision of a given player-box
    * @param {int} pnum - the player number (according to game), -1 means this player
    */
    GamePlayerBox.prototype.hideInfo = function (pnum) {
        if (pnum === void 0) { pnum = -1; }
        var selector = "#player-box-info-" + this._playerBox(pnum);
        try {
            document.querySelector(selector).classList.add("hidden");
        }
        catch (err) { }
    };
    /**
    * Hide the info subdivision of a given player-box
    * @param {int} pnum - the player number (according to game), -1 means this player
    */
    GamePlayerBox.prototype.showInfo = function (pnum) {
        if (pnum === void 0) { pnum = -1; }
        var selector = "#player-box-info-" + this._playerBox(pnum);
        try {
            document.querySelector(selector).classList.remove("hidden");
        }
        catch (err) {
        }
    };
    return GamePlayerBox;
}());
module.exports = GamePlayerBox;
//# sourceMappingURL=game-playerbox.js.map