export class Operator {
    public code: string;
    public text: string;
    public precedence: number;
    public isPrefix: boolean;
    public isInfix: boolean;
    public isAssociative: boolean;
    public isPredicate: boolean;
    public isOperator: boolean;
    public isFunction: boolean;
    constructor(code: string, text: string, precedence: number, isPrefix: boolean, isInfix: boolean, isAssociative: boolean, isPredicate: boolean) {
        let that = this;
        that.code = code;
        that.text = text;
        that.precedence = precedence;
        that.isPrefix = isPrefix;
        that.isInfix = isInfix;
        that.isAssociative = isAssociative;
        that.isPredicate = isPredicate;
        that.isFunction = false;
        that.isOperator = true;
    }
    public toString(): string {
        return this.text;
    }
}

function _createOperator(operators: any, code: string | null, text: string, precedence: number, isPrefix: boolean, isInfix: boolean, isAssociative: boolean, isPredicate: boolean) {
    operators[text] = new Operator(code || text, text, precedence, isPrefix, isInfix, isAssociative, isPredicate);
}

export class Operators {
    constructor() {
        this._registerOperators();
    }
    public byName(opName: string): Operator {
        const that: any = this;
        return <Operator>that[opName];
    }
    private _registerOperators(): void {
        const that = this;
        // Unary operators
        _createOperator(that, null, '.', 1, false, true, true, false);
        _createOperator(that, 'not', 'not', 5, true, true, true, true);
        _createOperator(that, '*', 'mul', 3, false, true, true, false);
        _createOperator(that, '/', 'div', 3, false, true, true, false);
        _createOperator(that, '%', 'mod', 3, false, true, true, false);
        _createOperator(that, '+', 'add', 4, false, true, true, false);
        _createOperator(that, '-', 'sub', 4, true, true, true, false);

        // Binary operators
        _createOperator(that, '=', 'eq', 5, false, true, false, true);
        _createOperator(that, '<>', 'ne', 5, false, true, false, true);
        _createOperator(that, '<', 'lt', 5, false, true, false, true);
        _createOperator(that, '<=', 'le', 5, false, true, false, true);
        _createOperator(that, '>', 'gt', 5, false, true, false, true);
        _createOperator(that, '>=', 'ge', 5, false, true, false, true);

        // in operator
        _createOperator(that, 'in', 'in', 5, false, true, false, true);

        // and or ()
        _createOperator(that, null, 'and', 6, false, true, true, true);
        _createOperator(that, null, 'or', 7, false, true, true, true);
        _createOperator(that, null, '(', 8, true, false, false, false);
        _createOperator(that, null, ')', 8, false, false, false, false);
        _createOperator(that, null, ',', 8, false, false, false, false);
    }

}

export class AggregationOperators {
    constructor() {
        this._registerOperators();
    }
    public byName(opName: string): Operator {
        const that: any = this;
        return <Operator>that[opName];
    }
    private _registerOperators(): void {
        let operators = this;
        _createOperator(operators, null, '.', 1, false, true, true, false);
        _createOperator(operators, null, 'as', 7, false, true, false, true);
        _createOperator(operators, null, '(', 8, true, false, false, false);
        _createOperator(operators, null, ')', 8, false, false, false, false);
        _createOperator(operators, null, ',', 8, false, true, false, true);
    }

}


export const operators = new Operators();
export const aggregationOperators = new AggregationOperators();

