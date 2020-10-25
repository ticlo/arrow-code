"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeUint8Array = exports.encodeUint8Array = exports.decodeDate = exports.encodeDate = void 0;
const base93_1 = require("./base93");
function encodeDate(self) {
    return '\u001bDate:' + self.toISOString();
}
exports.encodeDate = encodeDate;
function decodeDate(str) {
    return new Date(str.substr(6));
}
exports.decodeDate = decodeDate;
function encodeUint8Array(self) {
    return base93_1.default.encode(self, '\u001bBin:');
}
exports.encodeUint8Array = encodeUint8Array;
function decodeUint8Array(str) {
    return new Uint8Array(base93_1.default.decode(str, 5));
}
exports.decodeUint8Array = decodeUint8Array;
//# sourceMappingURL=codec.js.map