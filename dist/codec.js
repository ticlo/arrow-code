"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base91_1 = require("./base91");
function encodeDate(self) {
    return '\u001bDate:' + self.toISOString();
}
exports.encodeDate = encodeDate;
function decodeDate(str) {
    return new Date(str.substr(6));
}
exports.decodeDate = decodeDate;
function encodeUint8Array(self) {
    return base91_1.default.encode(self, '\u001bBin:');
}
exports.encodeUint8Array = encodeUint8Array;
function decodeUint8Array(str) {
    return new Uint8Array(base91_1.default.decode(str, 5));
}
exports.decodeUint8Array = decodeUint8Array;
//# sourceMappingURL=codec.js.map