import Base93 from './base93';

export function encodeDate(self: Date): string {
  return '\u001bDate:' + self.toISOString();
}
export function decodeDate(str: string): Date {
    return new Date(str.substr(6));
}

export function encodeUint8Array(self: Uint8Array): string {
  return Base93.encode(self, '\u001bBin:');
}
export function decodeUint8Array(str: string): Uint8Array {
  return new Uint8Array(Base93.decode(str, 5));
}
