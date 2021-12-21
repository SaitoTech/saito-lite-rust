var InviteFriendsQRTemplate = require('./invite-friends-qr.template');
module.exports = InviteFriendsQR = {
    render: function (app, data) {
        var _this = this;
        var el_parser = data.helpers.el_parser;
        if (!document.querySelector('.add-contact-modal-qr')) {
            document.querySelector(".welcome-modal-left").innerHTML = InviteFriendsQRTemplate();
        }
        var qrscanner = app.modules.returnModule("QRScanner");
        qrscanner.handleDecodedMessage = function (msg) { return _this.handleDecodedMessage(msg, app, data); };
        qrscanner.start(document.querySelector('video'), document.getElementById('qr-canvas'));
    },
    attachEvents: function (app, data) { },
    handleDecodedMessage: function (msg, app, data) {
        if (app.crypto.isPublicKey(msg)) {
            var publickey = msg;
            var qrscanner = app.modules.returnModule("QRScanner");
            qrscanner.decoder.terminate();
            data.startKeyExchange(publickey);
            data.stopVideo();
        }
    },
};
//# sourceMappingURL=invite-friends-qr.js.map