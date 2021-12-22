module.exports = ModalRegisterEmailTemplate = function (mode, MODES) {
    var content = {
        "header": "Connect an Email Address:",
        "description": "Email yourself an encrypted backup of your wallet:",
        "button": "EMAIL BACKUP",
        "opt_out": "I've already got a backup",
        "has_newsletter_option": true,
        "has_tip_text": true,
        "tip_text": "Your browser will encrypt your wallet and email you a copy. No-one but you will ever have access to your private keys. If you opt-in for email your browser will separately request periodic updates from the Saito project."
    };
    if (mode === MODES.NEWSLETTER) {
        content = {
            "header": "Sign up for the Newsletter:",
            "description": "Keep up to date on the latest Saito news",
            "button": "SIGN UP",
            "opt_out": "Nevermind, I'm not interested in novel consensus mechanisms",
            "has_newsletter_option": false,
            "has_tip_text": false,
            "tip_text": ""
        };
    }
    else if (mode === MODES.PRIVATESALE) {
        content = {
            "header": "Register interest in private sale:",
            "description": "Provide your email to register interest in participating in a private sale of Saito Tokens.",
            "button": "SIGN UP",
            "opt_out": "Nevermind, I'm not interested in novel consensus mechanisms",
            "has_newsletter_option": true,
            "has_tip_text": false,
            "tip_text": ""
        };
    }
    else if (mode === MODES.REGISTEREMAIL) {
        content = {
            "header": "Register an email address:",
            "description": "Your email address will be stored in your local database only, this might be useful in the future for peer-to-peer applications",
            "button": "Register",
            "opt_out": "Nevermind",
            "has_newsletter_option": true,
            "has_tip_text": false,
            "tip_text": ""
        };
    }
    return "  \n  <div class=\"welcome-modal-wrapper\">\n    <div class=\"welcome-modal-action\">\n      <div class=\"welcome-modal-left\">\n        <div class=\"welcome-modal-header\">".concat(content.header, "</h1></div>\n        <div class=\"welcome-modal-main\">\n          <div style=\"margin:1em 0\">").concat(content.description, "</div>\n          <div style=\"display:flex;\">\n            <input style=\"width:100%; color:black; font-size:1em; background:white;margin:0 1em 0 0;\" id=\"registry-input\" type=\"text\" placeholder=\"email@domain.com\">\n            <input style=\"display: var(--saito-wu);\" id=\"name\" name=\"name\" type=\"text\"></input>\n            <button id=\"backup-email-button\" style=\"clear:both; margin:unset; margin-left:0px; min-width:6em; font-size:0.7em;\">").concat(content.button, "</button>\n          </div>\n          ").concat(content.has_newsletter_option ? '<div style="font-size:0.9em;height:30px;margin-top:10px; display:"><input type="checkbox" id="signup" style="float:left;width:2em;height:2em;margin-right:10px" checked /><span style="padding-top:8px">Send periodic updates on important Saito news (max monthly)</span></div>' : '', "\n        </div>\n        <div class=\"welcome-modal-info\">\n            ").concat(content.has_tip_text ? "<div class=\"tip\"><b>How does this work? <i class=\"fas fa-info-circle\"></i></b><div class=\"tiptext\">".concat(content.tip_text, "</div></div>") : '', "\n          </div>\n      </div>\n    </div>\n    <div class=\"welcome-modal-exit tutorial-skip\">\n      <p>\n\t").concat(content.opt_out, "\n      </p>\n      <i class=\"fas fa-arrow-right\"></i>\n    </div>\n  </div>\n  ");
};
//# sourceMappingURL=modal-register-email.template.js.map