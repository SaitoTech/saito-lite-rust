"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = require('events');
var Connection = /** @class */ (function (_super) {
    __extends(Connection, _super);
    function Connection() {
        var _this = _super.call(this) || this;
        // I set this to 200 because 200 should be sufficient for anything. Default is 10.
        // I'd like to know if we go beyond 200. It is very easy to accidentally
        // create hundreds of listeners here if someone is doing app.connection.on()
        // in a render function that gets called repeatedly, for example.
        _this.setMaxListeners(200);
        return _this;
        // Please don't delete the following commented code yet:
        // This code should be enabled occasionally just to do a sanity check on
        // the number of listeners or as a way of doing debugging in case we
        // start to go beyond 200 totalListeners
        //
        // setInterval(() => {
        //   // console.log("***** app.connection listener counts *****");
        //   let totalListeners = 0;
        //   this.eventNames().forEach((eventName, i) => {
        //     let eventCount = this.listenerCount(eventName);
        //     totalListeners += eventCount;
        //     //console.log(`app.connection has ${eventCount} listeners for ${eventName}`);
        //   });
        //   console.log(`app.connection has ${totalListeners} listeners`);
        // }, 1000);
    }
    return Connection;
}(EventEmitter));
exports.default = Connection;
//# sourceMappingURL=connection.js.map