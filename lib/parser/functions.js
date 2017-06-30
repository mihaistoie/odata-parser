"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Func {
    constructor(name, argCount) {
        const that = this;
        that.name = name;
        that.argCount = argCount;
        that.isFunction = true;
    }
}
exports.Func = Func;
class FuncList {
    constructor() {
        this._registerFunctions();
    }
    _registerFunctions() {
        const that = this;
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
    byName(name) {
        const that = this;
        return that[name];
    }
}
exports.FuncList = FuncList;
class AggregationFuncList {
    constructor() {
        this._registerFunctions();
    }
    _registerFunctions() {
        const that = this;
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
    byName(name) {
        const that = this;
        return that[name];
    }
}
exports.AggregationFuncList = AggregationFuncList;
function _createFunction(functions, code, argCount) {
    functions[code] = new Func(code, argCount);
}
exports.odataFunctions = new FuncList();
exports.odataAggregationFunctions = new AggregationFuncList();
