import Base93 from './base93.js';
import * as Base64 from 'base64-js';

export function encodeDate(self: Date): string {
  return '͢Date:' + self.toISOString();
}

export function decodeDate(str: string): Date {
  return new Date(str.substring(6));
}


export function encodeUint8Array(self: Uint8Array): string {
  return Base93.encode(self, '͢Bin:');
}

export function decodeUint8Array(str: string): Uint8Array {
  return new Uint8Array(Base93.decode(str, 5));
}


export function encodeBase64(self: Uint8Array): string {
  return `͢B64:${Base64.fromByteArray(self)}`;
}

export function decodeBase64(str: string): Uint8Array {
  return new Uint8Array(Base64.toByteArray(str.substring(5)));
}


export function encodeBigInt(self: BigInt): string {
  return '͢n:' + self.toString();
}

export function decodeBigInt(str: string): BigInt {
  return BigInt(str.substring(3));
}
