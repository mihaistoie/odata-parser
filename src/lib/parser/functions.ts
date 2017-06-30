export class Func {
    public name: string;
    public argCount: number;
    public isFunction: boolean;
    constructor(name: string, argCount: number) {
        const that: any = this;
        that.name = name;
        that.argCount = argCount;
        that.isFunction = true;
    }
}


export class FuncList {
    constructor() {
        this._registerFunctions();
    }
    private _registerFunctions() {
        const that: any = this;
        _createFunction(that, 'contains', 2);
        _createFunction(that, 'endswith', 2);
        _createFunction(that, 'startswith', 2);
        _createFunction(that, 'indexof', 2);
        _createFunction(that, 'concat', 2);
        _createFunction(that, 'substring', 3);
        _createFunction(that, 'length', 1);
        _createFunction(that, 'tolower', 1);
        _createFunction(that, 'toupper', 1);
        _createFunction(that, 'trim', 1);
    }
    public byName(name: string): Func {
        const that: any = this;
        return <Func>that[name];
    }
}

export class AggregationFuncList {
    constructor() {
        this._registerFunctions();
    }
    private _registerFunctions() {
        const that: any = this;
        _createFunction(that, '$count', 0);
        _createFunction(that, '$sum', 1);
        _createFunction(that, '$avg', 1);
        _createFunction(that, '$max', 1);
        _createFunction(that, '$min', 1);
        _createFunction(that, '$first', 1);
        _createFunction(that, '$last', 1);



        _createFunction(that, '$concat', 1);
        _createFunction(that, '$substr', 1);
        _createFunction(that, '$toLower', 1);
        _createFunction(that, '$toUpper', 1);
        _createFunction(that, '$strcasecmp', 1);

        _createFunction(that, '$abs', 1);
        _createFunction(that, '$add', 1);
        _createFunction(that, '$ceil', 1);
        _createFunction(that, '$divide', 1);
        _createFunction(that, '$exp', 1);
        _createFunction(that, '$floor', 1);
        _createFunction(that, '$ln', 1);
        _createFunction(that, '$log', 1);
        _createFunction(that, '$log10', 1);
        _createFunction(that, '$mod', 1);
        _createFunction(that, '$multiply', 1);
        _createFunction(that, '$pow', 1);
        _createFunction(that, '$sqrt', 1);
        _createFunction(that, '$subtract', 1);
        _createFunction(that, '$trunc', 1);


        _createFunction(that, '$dayOfYear', 1);
        _createFunction(that, '$dayOfMonth', 1);
        _createFunction(that, '$dayOfWeek', 1);
        _createFunction(that, '$year', 1);
        _createFunction(that, '$month', 1);
        _createFunction(that, '$week', 1);
        _createFunction(that, '$hour', 1);
        _createFunction(that, '$minute', 1);
        _createFunction(that, '$second', 1);
        _createFunction(that, '$millisecond', 1);
        _createFunction(that, '$dateToString', 1);

    }
    public byName(name: string): Func {
        const that: any = this;
        return <Func>that[name];
    }
}

function _createFunction(functions: any, code: string, argCount: number): void {
    functions[code] = new Func(code, argCount)
}


export const odataFunctions = new FuncList();
export const odataAggregationFunctions = new AggregationFuncList();

