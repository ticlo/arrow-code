export default class Base93 {
    static encode(data: number[] | Uint8Array, prefix?: string): string;
    static decode(str: string, offset?: number, length?: number): number[];
}
