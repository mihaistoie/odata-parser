"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
exports.TokenType = {
    identifier: 'identifier',
    operator: 'operator',
    literal: 'literal',
    array: 'array',
    func: 'function'
};
class Token {
    constructor(type, value, line, offset, dataType) {
        let that = this;
        that.type = type;
        that.value = value;
        that._line = line;
        that._offset = offset;
        that.dataType = dataType;
        that.identifierType = 0;
    }
    matches(code) {
        let that = this;
        return that.value && typeof that.value === 'object' && that.value.isOperator && that.value.code === code;
    }
    push(token) {
        this.items = this.items || [];
        this.items.push(token);
    }
    getRemainingText() {
        let that = this;
        return that._line.substring(that._offset, that._line.length);
    }
}
exports.Token = Token;
const _digitRegex = new RegExp('[0-9]');
const _letterRegex = new RegExp('[a-zA-Z_\/\$]');
const _wordRegex = new RegExp('[a-zA-Z0-9_\.\/\$]');
function _skipSpaces(chars, i) {
    while (i < chars.length && chars[i] === ' ') {
        i++;
    }
    return i;
}
function _isDigit(str) {
    return _digitRegex.test(str);
}
function _isDateChar(str) {
    let res = _digitRegex.test(str);
    if (!res)
        res = ['-', '.', 'Z', 'T', ':'].indexOf(str) >= 0;
    return res;
}
function _isLetter(str) {
    return _letterRegex.test(str);
}
function _isWordChar(str) {
    return _wordRegex.test(str);
}
function _parseNumberOrDate(line, chars, i, tokens) {
    let end = i + 1;
    let cdt;
    let ll = chars.length;
    let isDate = false;
    let hasPoint = false;
    let cv = [chars[i]];
    while (true) {
        if (end >= ll)
            break;
        if (!_isDigit(chars[end])) {
            if (isDate) {
                if (!_isDateChar(chars[end])) {
                    break;
                }
            }
            else {
                if (chars[end] === '.') {
                    if (hasPoint) {
                        throw new Error(util.format('Expression parser: invalid number: %s', line.substring(i, end + 1)));
                    }
                    hasPoint = true;
                }
                else if (chars[end] === '-') {
                    if (hasPoint) {
                        throw new Error(util.format('Expression parser: invalid number: %s', line.substring(i, end + 1)));
                    }
                    if (cv.length !== 2 && cv.length !== 4) {
                        throw new Error(util.format('Expression parser: invalid number: %s', line.substring(i, end + 1)));
                    }
                    isDate = true;
                }
                else
                    break;
            }
        }
        cv.push(chars[end]);
        end++;
    }
    if (!isDate) {
        let val;
        if (hasPoint) {
            val = parseFloat(cv.join(''));
            cdt = 'float';
        }
        else {
            val = parseInt(cv.join(''), 10);
            cdt = 'int';
        }
        let nt = new Token(exports.TokenType.literal, val, line, i, cdt);
        tokens.push(nt);
    }
    else {
        let sv = cv.join('');
        if (!_isISODate(sv))
            throw new Error(util.format('Expression parser: invalid date: %s', sv));
        tokens.push(new Token(exports.TokenType.literal, sv, line, i, 'datetime'));
    }
    return end;
}
function _parseNumber(line, chars, i, tokens) {
    let end = i + 1;
    let cdt;
    while (end < chars.length && _isDigit(chars[end])) {
        end++;
    }
    let val;
    if (end < chars.length && chars[end] === '.') {
        end++;
        while (end < chars.length && _isDigit(chars[end])) {
            end++;
        }
        val = parseFloat(line.substring(i, end));
        cdt = 'float';
    }
    else {
        val = parseInt(line.substring(i, end), 10);
        cdt = 'int';
    }
    let nt = new Token(exports.TokenType.literal, val, line, i, cdt);
    tokens.push(nt);
    return end;
}
function _parseDateTime(line, chars, i, tokens) {
    let dt = 'datetime\'';
    i = i + dt.length;
    let end = i + 1, len = chars.length;
    while (end < len) {
        if (chars[end] === '\'')
            break;
        end++;
    }
    if (end === chars.length) {
        throw new Error(util.format('Expression parser: date constant not terminated: %s', line.substring(i, line.length)));
    }
    let str = chars.substr(i, end - i - 1);
    if (!_isISODate(str))
        throw new Error(util.format('Expression parser: invalid date: %s', +str));
    let nt = new Token(exports.TokenType.literal, str, line, i, 'datetime');
    nt.svalue = str;
    tokens.push(nt);
    return end + 1;
}
function _parseWord(line, chars, i, tokens, operators) {
    let end = i + 1;
    while (end < chars.length && _isWordChar(chars[end])) {
        end++;
    }
    let word = chars.substr(i, end - i);
    if (word === 'datetime' && end < chars.length && chars[end] === '\'') {
        return _parseDateTime(line, chars, i, tokens);
    }
    let op = operators.byName(word.toLowerCase());
    if (op) {
        tokens.push(new Token(exports.TokenType.operator, op, line, i, null));
    }
    else {
        if (word === 'true' || word === 'false' || word === 'null') {
            tokens.push(new Token(exports.TokenType.literal, JSON.parse(word), line, i, 'bool'));
        }
        else {
            tokens.push(new Token(exports.TokenType.identifier, word, line, i, 'word'));
        }
    }
    return end;
}
function _parseQuotedString(line, chars, i, tokens) {
    let quote = chars[i];
    let end = i + 1;
    let res = '';
    while (end < chars.length) {
        if (chars[end] === quote) {
            end++;
            if (end === chars.length || chars[end] !== quote) {
                tokens.push(new Token(exports.TokenType.literal, res, line, i, 'string'));
                return end;
            }
        }
        res += chars[end++];
    }
    throw new Error(util.format('Expression parser: quoted string not terminated: %s', line.substring(i)));
}
function _parseOperator(line, chars, i, tokens, operators) {
    let op = operators.byName(chars);
    tokens.push(new Token(exports.TokenType.operator, op, line, i, null));
    return i + 1;
}
function tokenize(line, operators, identifiers, onIdentifier) {
    let tokens = [];
    let i = 0;
    while (i < line.length) {
        i = _skipSpaces(line, i);
        let ch = line[i];
        switch (ch) {
            case '"':
            case '\'':
                i = _parseQuotedString(line, line, i, tokens);
                break;
            case '-':
            case '+':
            case '(':
            case ')':
            case ',':
                i = _parseOperator(line, ch, i, tokens, operators);
                break;
            default:
                if (_isLetter(ch)) {
                    i = _parseWord(line, line, i, tokens, operators);
                }
                else if (_isDigit(ch)) {
                    i = _parseNumberOrDate(line, line, i, tokens);
                }
                else {
                    throw new Error(util.format('Expression parser: invalid character: "%s"', ch));
                }
                break;
        }
    }
    // concat
    const ct = [];
    let j = 0, ll = tokens.length;
    while (j < ll) {
        let tk = tokens[j];
        ct.push(tk);
        if (tk.type === exports.TokenType.operator) {
            let op = tk.value;
            if (op.text === 'in') {
                let a = new Token(exports.TokenType.array, '', '', i, 'array');
                ct.push(a);
                for (let k = j + 1; k < ll; k++) {
                    tk = tokens[k];
                    j++;
                    if (tk.type === exports.TokenType.operator && tk.value.text === ')')
                        break;
                    if (tk.type === exports.TokenType.literal)
                        a.push(tk);
                }
            }
        }
        j++;
    }
    tokens = ct;
    const len = tokens.length;
    tokens.forEach((token, index) => {
        if (token.type === exports.TokenType.identifier) {
            token.value = token.value.replace(/\//g, '.');
            if (identifiers) {
                let found = false;
                if (identifiers[token.value]) {
                    found = true;
                    token.identifierType = 1;
                }
                if (!found) {
                    if (index < len - 1) {
                        if (tokens[index + 1].matches('(')) {
                            // Function identifier
                            found = true;
                            token.identifierType = 2;
                        }
                    }
                    if (!found)
                        throw new Error(util.format('Identifier not found. ("%s")', token.value));
                }
            }
            if (onIdentifier) {
                onIdentifier(token);
            }
        }
    });
    return tokens;
}
exports.tokenize = tokenize;
function _isISODate(value) {
    if (!value)
        return false;
    if (value.indexOf('-') !== 2 && value.indexOf('-') !== 4)
        return false;
    let res = new Date(value);
    if (Object.prototype.toString.call(res) === '[object Date]') {
        // it is a date
        if (isNaN(res.getTime()))
            return false;
        return true;
    }
    return false;
}
