"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base91_1 = require("./base91");
const Base64 = require("base64-js");
function encodeDate(self) {
    return '\u001bDate:' + self.getTime();
}
exports.encodeDate = encodeDate;
function decodeDate(str) {
    let ts = parseInt(str.substr(6));
    if (ts === ts) {
        return new Date(ts);
    }
    return undefined;
}
exports.decodeDate = decodeDate;
function encodeUint8Array(self) {
    return '\u001bBin:' + Base64.fromByteArray(self);
}
exports.encodeUint8Array = encodeUint8Array;
function decodeUint8Array(str) {
    return new Uint8Array(Base64.toByteArray(str.substr(5)));
}
exports.decodeUint8Array = decodeUint8Array;
function encodeUint8ArrayBase91(self) {
    return base91_1.default.encode(self, '\u001bB91:');
}
exports.encodeUint8ArrayBase91 = encodeUint8ArrayBase91;
function decodeUint8ArrayBase91(str) {
    return new Uint8Array(base91_1.default.decode(str, 5));
}
exports.decodeUint8ArrayBase91 = decodeUint8ArrayBase91;
//# sourceMappingURL=codec.js.map