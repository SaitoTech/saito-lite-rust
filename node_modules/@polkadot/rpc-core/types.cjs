"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typesJsonrpc = require("./types.jsonrpc.cjs");

Object.keys(_typesJsonrpc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _typesJsonrpc[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _typesJsonrpc[key];
    }
  });
});