export declare class Expression {
    children: Expression[] | null;
    type: string;
    value: any;
    svalue: string;
    dataType: string;
    constructor(config: any);
    isPredicate(): boolean;
    toString(): string;
}
export declare class Parser {
    private _functions;
    private _operators;
    constructor(functions: any, loperators: any);
    parse(str: string, identifiers?: any, onidentifier?: any): Expression | null;
    parseNe(str: string, identifiers?: any, onidentifier?: any): Expression | null;
}
export declare const OdataParser: Parser;
export declare const OdataAggergationParser: Parser;
