export default class JsonEsc {
    private _encodeTable;
    private _decodeTable;
    constructor();
    registerDate(): void;
    registerRaw(key: string, type: object, encoder: (self: object) => string, decoder: (str: string) => object): void;
    register(key: string, type: object, encoder: (self: object) => string, decoder: (str: string) => object): void;
    reviver(key: string, value: any): any;
    replacer(key: string, value: any, parent: any): any;
    parse(str: string): any;
    stringify(input: any, space?: number): string;
    stringifySorted(input: any, space?: number): string;
    private static defaultEncoder;
    static parse(str: string): any;
    static stringify(input: any, space?: number, sortKeys?: boolean): string;
}
