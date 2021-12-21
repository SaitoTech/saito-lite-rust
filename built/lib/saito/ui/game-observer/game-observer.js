var GameObserverTemplate = require('./game-observer.template');
var GameObserver = /** @class */ (function () {
    function GameObserver(app) {
        this.app = app;
    }
    GameObserver.prototype.render = function (app, game_mod) {
        this.game_mod = game_mod;
        if (!document.getElementById("game-observer-next")) {
            app.browser.addElementToDom(GameObserverTemplate());
        }
    };
    GameObserver.prototype.attachEvents = function (app, mod) {
        var _this = this;
        document.getElementById("game-observer-next-btn").onclick = function (e) {
            _this.next(app, mod);
        };
        document.getElementById("game-observer-last-btn").onclick = function (e) {
            _this.last(app, mod);
        };
    };
    GameObserver.prototype.next = function (app, mod) {
        var observer_self = this;
        var current_queue_hash = app.crypto.hash(JSON.stringify(mod.game.queue));
        //
        // unhalt the game
        //
        mod.game.halted = 0;
        mod.game.gaming_active = 0;
        mod.saveGame(mod.game.id);
        var arcade_mod = app.modules.returnModule("Arcade");
        if (arcade_mod == null) {
            alert("ERROR 413231: Arcade Module not Installed");
            return;
        }
        arcade_mod.observerDownloadNextMoves(mod, function (mod2) {
            mod = mod2;
            if (mod.game.future.length == 0) {
                salert("No Moves Yet Available Beyond this Point");
                observer_self.hideNextMoveButton();
                return;
            }
            if (mod.game.queue.length > 0) {
                if (mod.game.queue[mod.game.queue.length - 1] === "OBSERVER_CHECKPOINT") {
                    mod.game.queue.splice(mod.game.queue.length - 1, 1);
                }
            }
            mod.runQueue();
            mod.processFutureMoves();
            if (mod.game.future.length == 0) {
                var revised_queue_hash = app.crypto.hash(JSON.stringify(mod.game.queue));
                if (revised_queue_hash === current_queue_hash) {
                    salert("No Moves Yet Available Beyond this Point");
                    observer_self.hideNextMoveButton();
                    return;
                }
            }
        });
    };
    GameObserver.prototype.last = function (app, mod) {
        var arcade_mod = app.modules.returnModule("Arcade");
        if (arcade_mod == null) {
            alert("ERROR 413252: Arcade Module not Installed");
            return;
        }
        salert("Please wait while we move back one step...");
        arcade_mod.initializeObserverModePreviousStep(mod.game.id, mod.game.step.ts);
    };
    GameObserver.prototype.hideNextMoveButton = function () {
        document.getElementById("game-observer-next").style.display = "none";
    };
    GameObserver.prototype.showNextMoveButton = function () {
        document.getElementById("game-observer-next").style.display = "block";
    };
    GameObserver.prototype.hideLastMoveButton = function () {
        document.getElementById("game-observer-last").style.display = "none";
    };
    GameObserver.prototype.showLastMoveButton = function () {
        document.getElementById("game-observer-last").style.display = "block";
    };
    return GameObserver;
}());
module.exports = GameObserver;
//# sourceMappingURL=game-observer.js.map