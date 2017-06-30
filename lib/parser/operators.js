"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Operator {
    constructor(code, text, precedence, isPrefix, isInfix, isAssociative, isPredicate) {
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
    toString() {
        return this.text;
    }
}
exports.Operator = Operator;
function _createOperator(operators, code, text, precedence, isPrefix, isInfix, isAssociative, isPredicate) {
    operators[text] = new Operator(code || text, text, precedence, isPrefix, isInfix, isAssociative, isPredicate);
}
class Operators {
    constructor() {
        this._registerOperators();
    }
    byName(opName) {
        const that = this;
        return that[opName];
    }
    _registerOperators() {
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
exports.Operators = Operators;
class AggregationOperators {
    constructor() {
        this._registerOperators();
    }
    byName(opName) {
        const that = this;
        return that[opName];
    }
    _registerOperators() {
        let operators = this;
        _createOperator(operators, null, '.', 1, false, true, true, false);
        _createOperator(operators, null, 'as', 7, false, true, false, true);
        _createOperator(operators, null, '(', 8, true, false, false, false);
        _createOperator(operators, null, ')', 8, false, false, false, false);
        _createOperator(operators, null, ',', 8, false, true, false, true);
    }
}
exports.AggregationOperators = AggregationOperators;
exports.operators = new Operators();
exports.aggregationOperators = new AggregationOperators();
