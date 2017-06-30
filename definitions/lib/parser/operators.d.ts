export declare class Operator {
    code: string;
    text: string;
    precedence: number;
    isPrefix: boolean;
    isInfix: boolean;
    isAssociative: boolean;
    isPredicate: boolean;
    isOperator: boolean;
    isFunction: boolean;
    constructor(code: string, text: string, precedence: number, isPrefix: boolean, isInfix: boolean, isAssociative: boolean, isPredicate: boolean);
    toString(): string;
}
export declare class Operators {
    constructor();
    byName(opName: string): Operator;
    private _registerOperators();
}
export declare class AggregationOperators {
    constructor();
    byName(opName: string): Operator;
    private _registerOperators();
}
export declare const operators: Operators;
export declare const aggregationOperators: AggregationOperators;
