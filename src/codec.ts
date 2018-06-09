import Base91 from './base91';
import * as Base64 from 'base64-js';

export function encodeDate(self: Date): string {
  return '\u001bDate:' + self.getTime();
}
export function decodeDate(str: string): Date {
  let ts = parseInt(str.substr(6));
  if (ts === ts) {
    return new Date(ts);
  }
  return undefined;
}

export function encodeUint8Array(self: Uint8Array): string {
  return '\u001bBin:' + Base64.fromByteArray(self);
}
export function decodeUint8Array(str: string): Uint8Array {
  return new Uint8Array(Base64.toByteArray(str.substr(5)));
}

export function encodeUint8ArrayBase91(self: Uint8Array): string {
  return Base91.encode(self, '\u001bB91:');
}
export function decodeUint8ArrayBase91(str: string): Uint8Array {
  return new Uint8Array(Base91.decode(str, 5));
}
