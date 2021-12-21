var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ModTemplate = require('./modtemplate');
var UIModTemplate = /** @class */ (function (_super) {
    __extends(UIModTemplate, _super);
    function UIModTemplate(app, path) {
        var _this = _super.call(this, app) || this;
        //
        // ui components are always visible by definition
        //
        if (_this.browser_active == 0) {
            _this.browser_active = 1;
        }
        if (_this.name == "") {
            _this.name = "UI Component";
        }
        ;
        return _this;
    }
    UIModTemplate.prototype.initialize = function (app) {
        //
        // all other modules have been initialized and added
        // to app.modules by the time that we get around to 
        // creating UI components (render), so when we are 
        // creating these UI components we manually add the 
        // modules and initialize them here.
        //
        if (!app.modules.uimods.includes(this)) {
            app.modules.uimods.push(this);
        }
        _super.prototype.initialize.call(this, app);
    };
    return UIModTemplate;
}(ModTemplate));
module.exports = UIModTemplate;
//# sourceMappingURL=uimodtemplate.js.map