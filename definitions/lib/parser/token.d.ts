export declare const TokenType: {
    identifier: string;
    operator: string;
    literal: string;
    array: string;
    func: string;
};
export declare class Token {
    type: string;
    private _line;
    dataType: string | null;
    value: any;
    svalue: string;
    private _offset;
    identifierType: number;
    items: Token[] | null;
    constructor(type: string, value: any, line: string, offset: number, dataType: string | null);
    matches(code: string): boolean;
    push(token: Token): void;
    getRemainingText(): string;
}
export declare function tokenize(line: string, operators: any, identifiers?: any, onIdentifier?: (token: Token) => void): Token[];
