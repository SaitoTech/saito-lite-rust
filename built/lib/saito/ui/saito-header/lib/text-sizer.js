module.exports = TextSizer = {
    render: function (app, mod) {
        if (!document.getElementById("text-sizer")) {
            var html = "\n      <div class=\"wallet-action-row\">\n      <div id=\"text-sizer\">\n        <table class=\"text-sizer-table\">\n          <thead>\n            <tr>\n              <td><div class=\"fas fa-text-height\"></div></td>\n              <td><div id=\"text-sizer-small\" class=\"text-sizer-small\">A /</div></td>\n              <td>\n                <div id=\"text-sizer-medium\" class=\"text-sizer-medium\">A /</div>\n              </td>\n              <td><div id=\"text-sizer-large\" class=\"text-sizer-large\">A</div></td>\n            </tr>\n          </thead>\n        </table>\n      </div>\n    </div>\n    <hr />";
            app.browser.addElementToDom(html, 'settings-dropdown');
            this.attachEvents(app, mod);
        }
    },
    attachEvents: function (app, mod) {
        document.querySelector('.text-sizer-small').addEventListener('click', function () {
            document.body.style.fontSize = "1em";
        });
        document.querySelector('.text-sizer-medium').addEventListener('click', function () {
            document.body.style.fontSize = "1.2em";
        });
        document.querySelector('.text-sizer-large').addEventListener('click', function () {
            document.body.style.fontSize = "1.5em";
        });
    }
};
//# sourceMappingURL=text-sizer.js.map