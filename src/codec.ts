import Base93 from './base93';
import * as Base64 from 'base64-js';

export function encodeDate(self: Date): string {
  return '\u001bDate:' + self.toISOString();
}

export function decodeDate(str: string): Date {
  return new Date(str.substring(6));
}


export function encodeUint8Array(self: Uint8Array): string {
  return Base93.encode(self, '\u001bBin:');
}

export function decodeUint8Array(str: string): Uint8Array {
  return new Uint8Array(Base93.decode(str, 5));
}


export function encodeBase64(self: Uint8Array): string {
  return `\u001bB64:${Base64.fromByteArray(self)}`;
}

export function decodeBase64(str: string): Uint8Array {
  return new Uint8Array(Base64.toByteArray(str.substring(5)));
}
