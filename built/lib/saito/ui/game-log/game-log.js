var GameLogTemplate = require('./game-log.template');
var GameLog = /** @class */ (function () {
    function GameLog(app) {
        this.app = app;
        this.logs = [];
        this.logs_length = 150;
        this.logs_last_msg = '';
        // backwards compatibility for older functions
        // which do not have a reference to the module
        // so we create one and then add it on the first
        // render.
        this.mod = null;
    }
    GameLog.prototype.render = function (app, mod) {
        if (this.mod == null) {
            this.mod = mod;
        }
        if (!document.querySelector("#log")) {
            app.browser.addElementToDom(GameLogTemplate());
        }
        var log = document.getElementById('log');
        if (log) {
            log.innerHTML = this.logs.slice(0, this.logs_length).map(function (log) { return "> <span> ".concat(log, " </span>"); }).join('<br>');
        }
    };
    GameLog.prototype.attachEvents = function (app, game_mod) {
        var _this = this;
        var xpos = 0;
        var ypos = 0;
        document.querySelector('#log').onmousedown = function (e) {
            xpos = e.clientX;
            ypos = e.clientY;
        };
        document.querySelector('#log').onmouseup = function (e) {
            if (Math.abs(xpos - e.clientX) > 4) {
                return;
            }
            if (Math.abs(ypos - e.clientY) > 4) {
                return;
            }
            _this.toggleLog();
        };
        // outdated - MARCH 18
        //document.querySelector('#log').onclick = (e) => {
        //  this.toggleLog();
        //};
    };
    GameLog.prototype.toggleLog = function () {
        document.querySelector('#log').toggleClass('log-lock');
    };
    GameLog.prototype.updateLog = function (log_str, callback, force) {
        if (force === void 0) { force = 0; }
        var add_this_log_message = 1;
        if (log_str === this.logs_last_msg) {
            add_this_log_message = 0;
            if (log_str.indexOf("removes") > -1) {
                add_this_log_message = 1;
            }
            if (log_str.indexOf("places") > -1) {
                add_this_log_message = 1;
            }
        }
        if (add_this_log_message == 1 || force == 1) {
            this.logs_last_msg = log_str;
            this.logs.unshift(log_str);
            this.render(this.app, this.mod);
            callback();
        }
    };
    return GameLog;
}());
module.exports = GameLog;
//# sourceMappingURL=game-log.js.map