import Base91 from './base91';

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
  return '\u001bBin:' + Base91.encode(self);
}
export function decodeUint8Array(str: string): Uint8Array {
  return new Uint8Array(Base91.decode(str, 5));
}


export function encodeBuffer(self: ArrayBuffer): string {
  return '\u001bBuf:' + Base91.encode(new Uint8Array(self));
}
export function decodeBuffer(str: string): ArrayBuffer {
  return new Uint8Array(Base91.decode(str, 5)).buffer;
}
