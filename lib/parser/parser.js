"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const token_1 = require("./token");
const operators_1 = require("./operators");
const functions_1 = require("./functions");
class Expression {
    constructor(config) {
        const that = this;
        that.children = null;
        if (config.operator) {
            that.type = token_1.TokenType.operator;
            that.value = config.operator;
            that.children = [];
            if (config.expression1) {
                that.children.push(config.expression1);
            }
            if (config.expression2) {
                that.children.push(config.expression2);
            }
        }
        else if (config.expressionType) {
            that.type = config.expressionType;
            that.value = config.value;
            that.svalue = config.svalue;
            that.dataType = config.dataType;
            if (that.type === token_1.TokenType.func) {
                that.children = [];
            }
        }
    }
    isPredicate() {
        switch (this.type) {
            case token_1.TokenType.operator:
                return this.value.isPredicate;
            case token_1.TokenType.identifier:
                return true; // Don't know
            case token_1.TokenType.func:
                return true; // Don't know -- will improve later
            case token_1.TokenType.literal:
                return false;
            default:
                throw new Error(util.format('Expression parser: invalid expression type: %s', this.type));
        }
    }
    toString() {
        let that = this;
        if (that.children == null) {
            return that.value.toString();
        }
        const sb = [];
        sb.push('[' + that.value.toString());
        that.children.forEach(child => { sb.push(' ' + child.toString()); });
        sb.push(']');
        return sb.join('');
    }
}
exports.Expression = Expression;
const _maxPrecedence = 10;
function _parseArguments(tokens, tk, tokenIndex, args, functions) {
    if (tokenIndex[0] < tokens.length && tokens[tokenIndex[0]].matches(')')) {
        tokenIndex[0]++;
        return;
    }
    while (tokenIndex[0] < tokens.length) {
        let arg = _parseExpression(tokens, tokenIndex, _maxPrecedence, functions);
        args.push(arg);
        if (tokenIndex[0] < tokens.length && tokens[tokenIndex[0]].matches(')')) {
            tokenIndex[0]++;
            return;
        }
        if (tokenIndex[0] === tokens.length || !tokens[tokenIndex[0]].matches(',')) {
            throw new Error(util.format('Expression parser:invalid expression: expected \',\' or \')\' at %s', tokens[tokenIndex[0]].getRemainingText()));
        }
        tokenIndex[0]++;
    }
    throw new Error(util.format('Expression parser:invalid function call syntax: argument missing after %s', tk.getRemainingText()));
}
function _parseFunctionCall(tokens, tk, tokenIndex, functions) {
    tokenIndex[0]++;
    let func = functions.byName(tk.value);
    if (!func)
        throw new Error(util.format('Expression parser:Invalid function name  %s', tk.value));
    let exp = new Expression({
        expressionType: token_1.TokenType.func,
        value: func
    });
    _parseArguments(tokens, tk, tokenIndex, exp.children || [], functions);
    return exp;
}
function _parsePrefixOperator(tokens, op, tokenIndex, functions) {
    switch (op.code) {
        case '-':
        case 'not':
            return new Expression({
                operator: op,
                expression1: _parseExpression(tokens, tokenIndex, 1, functions)
            });
        case '(':
            const arg1 = _parseExpression(tokens, tokenIndex, op.precedence, functions);
            if (tokenIndex[0] === tokens.length || !tokens[tokenIndex[0]].matches(')')) {
                throw new Error(util.format('Expression parser:invalid expression: expected \)\ after %s', tokens[tokenIndex[0] - 1].getRemainingText()));
            }
            tokenIndex[0]++;
            return arg1;
        default:
            throw new Error(util.format('Expression parser:internal error: bad prefix operator %s', op.code));
    }
}
function _parseTerm(tokens, tokenIndex, functions) {
    if (tokenIndex[0] === tokens.length) {
        throw new Error('Expression parser: premature end of expression');
    }
    let tk = tokens[tokenIndex[0]];
    switch (tk.type) {
        case token_1.TokenType.identifier:
            tokenIndex[0]++;
            if (tokenIndex[0] < tokens.length && tokens[tokenIndex[0]].matches('(')) {
                return _parseFunctionCall(tokens, tk, tokenIndex, functions);
            }
            else {
                return new Expression({
                    expressionType: token_1.TokenType.identifier,
                    value: tk.value
                });
            }
        case token_1.TokenType.array:
            tokenIndex[0]++;
            return new Expression({
                expressionType: token_1.TokenType.array,
                value: tk.items,
                dataType: tk.dataType
            });
        case token_1.TokenType.literal:
            tokenIndex[0]++;
            return new Expression({
                expressionType: token_1.TokenType.literal,
                value: tk.value,
                svalue: tk.svalue,
                dataType: tk.dataType
            });
        case token_1.TokenType.operator:
            let op = tk.value;
            if (!op.isPrefix) {
                throw new Error(util.format('Expression parser: invalid expression: expected beginning of term at %s', tk.getRemainingText()));
            }
            tokenIndex[0]++;
            return _parsePrefixOperator(tokens, op, tokenIndex, functions);
        default:
            throw new Error(util.format('Expression parser: internal error: bad token type %s', tk.type));
    }
}
function _parseExpression(tokens, tokenIndex, precedence, functions) {
    let exp = _parseTerm(tokens, tokenIndex, functions);
    while (tokenIndex[0] < tokens.length) {
        let tk = tokens[tokenIndex[0]];
        const op = (tk.value && tk.value.isOperator ? tk.value : null);
        if (op === null || !op.isInfix || op.precedence > precedence) {
            break;
        }
        tokenIndex[0]++;
        let arg = _parseExpression(tokens, tokenIndex, op.precedence - 1, functions);
        exp = new Expression({
            operator: op,
            expression1: exp,
            expression2: arg
        });
        if (!op.isAssociative && op.precedence === precedence) {
            return exp;
        }
    }
    return exp;
}
class Parser {
    constructor(functions, loperators) {
        this._functions = functions;
        this._operators = loperators;
    }
    parse(str, identifiers, onidentifier) {
        str = str || '';
        str = str.trim();
        if (str.length === 0) {
            return null;
        }
        let tokens = token_1.tokenize(str, this._operators, identifiers, onidentifier);
        let tokenIndex = [];
        tokenIndex[0] = 0;
        let exp = _parseExpression(tokens, tokenIndex, _maxPrecedence, this._functions);
        if (tokenIndex[0] !== tokens.length) {
            throw new Error(util.format('Expression parser: invalid expression: unexpected token at %s', tokens[tokenIndex[0]].getRemainingText()));
        }
        return exp;
    }
    parseNe(str, identifiers, onidentifier) {
        let that = this;
        try {
            return that.parse(str, identifiers, onidentifier);
        }
        catch (ex) {
            return null;
        }
    }
}
exports.Parser = Parser;
exports.OdataParser = new Parser(functions_1.odataFunctions, operators_1.operators);
exports.OdataAggergationParser = new Parser(functions_1.odataAggregationFunctions, operators_1.aggregationOperators);
