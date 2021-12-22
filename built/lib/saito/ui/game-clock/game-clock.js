var GameClockTemplate = require('./game-clock.template');
var GameClock = /** @class */ (function () {
    function GameClock(app, height, width) {
        if (height === void 0) { height = 50; }
        if (width === void 0) { width = 150; }
        this.app = app;
        this.height = height;
        this.width = width;
    }
    GameClock.prototype.render = function (app, game_mod) {
        var clock = 3600000;
        if (game_mod) {
            if (parseInt(game_mod.clock_limit) > 0) {
                clock = parseInt(game_mod.clock_limit) - parseInt(game_mod.clock_spent);
            }
        }
        try {
            if (!document.getElementById('game-clock')) {
                document.body.append(elParser(GameClockTemplate()));
            }
        }
        catch (err) {
        }
        this.displayTime(clock);
    };
    GameClock.prototype.attachEvents = function (app, data) {
        var _this = this;
        try {
            document.querySelector('.game-clock').addEventListener('click', function (e) {
                _this.moveClock();
            });
        }
        catch (err) {
        }
    };
    GameClock.prototype.returnHours = function (x) {
        return Math.floor(this.returnMinutes(x) / 60);
    };
    GameClock.prototype.returnMinutes = function (x) {
        return Math.floor(this.returnSeconds(x) / 60);
    };
    GameClock.prototype.returnSeconds = function (x) {
        return Math.floor(x / 1000);
    };
    GameClock.prototype.displayTime = function (clock) {
        var hours = this.returnHours(clock);
        var minutes = this.returnMinutes(clock);
        var seconds = this.returnSeconds(clock);
        seconds = seconds - (minutes * 60);
        minutes = minutes - (hours * 60);
        if (hours < 0) {
            hours = 0;
        }
        if (minutes < 0) {
            minutes = 0;
        }
        if (seconds < 0) {
            seconds = 0;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        try {
            document.getElementById('game-clock-hours').innerHTML = hours;
            document.getElementById('game-clock-minutes').innerHTML = minutes;
            document.getElementById('game-clock-seconds').innerHTML = seconds;
        }
        catch (err) {
        }
    };
    GameClock.prototype.moveClock = function () {
        var c = document.querySelector('.game-clock');
        if (c.style.top === "0px" || c.style.top == null || c.style.top === " " || c.style.top == "") {
            c.style.top = "unset";
            c.style.bottom = "0px";
        }
        else {
            c.style.bottom = "unset";
            c.style.top = "0px";
        }
    };
    return GameClock;
}());
module.exports = GameClock;
//# sourceMappingURL=game-clock.js.map