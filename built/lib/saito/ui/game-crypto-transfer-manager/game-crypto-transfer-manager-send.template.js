module.exports = GameCryptoTransferManagerSendTemplate = function (app, sobj) {
    return "  \n  <div class=\"game-crypto-transfer-manager-container\">\n    \n    <h2 class=\"auth_title\">Authorize Crypto Transfer</h2>\n\n    <div class=\"amount\">".concat(sobj.amount, " ").concat(sobj.ticker, "</div>\n\n    <div class=\"send_to\">to</div>\n\n    <div class=\"to_address\">").concat(sobj.to, "</div>\n\n    <div class=\"button crypto_transfer_btn\" id=\"crypto_transfer_btn\">authorize</div>\n\n  </div>\n  ");
};
//# sourceMappingURL=game-crypto-transfer-manager-send.template.js.map