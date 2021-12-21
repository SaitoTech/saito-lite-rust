var ModalTemplate = require('./modal-template.js');
var ModalBlankTemplate = require('./modal-blank-template.js');
var elParser = require('../../helpers/el_parser');
var Modal = /** @class */ (function () {
    function Modal(app, _a) {
        var id = _a.id, title = _a.title, content = _a.content;
        this.app = app;
        this.id = id;
        this.title = title;
        this.content = content;
    }
    Modal.prototype.render = function (type) {
        if (type === void 0) { type = ""; }
        switch (type) {
            case "":
                document.querySelector('body').append(elParser(ModalTemplate(this)));
                this.attachEvents();
            case "blank":
                document.querySelector('body').append(elParser(ModalBlankTemplate(this)));
        }
        document.getElementById("".concat(this.id, "-modal")).style.display = 'unset';
    };
    Modal.prototype.destroy = function () {
        try {
            document.querySelector('body').removeChild(document.getElementById("".concat(this.id, "-modal")));
        }
        catch (e) {
            console.log(e);
        }
    };
    Modal.prototype.attachEvents = function (callback) {
        if (callback === void 0) { callback = null; }
        var modal = document.getElementById("".concat(this.id, "-modal"));
        document.getElementById("modal-close")
            .onclick = function () { return modal.style.display = "none"; };
        document.addEventListener('keydown', function (e) {
            if (e.keyCode == '27') {
                modal.style.display = "none";
            }
        });
        if (callback)
            callback();
    };
    return Modal;
}());
module.exports = Modal;
//# sourceMappingURL=modal.js.map