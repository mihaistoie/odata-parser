import * as util from 'util';

import { OdataParser, OdataAggergationParser, TokenType, Expression } from './index';



export function $filter2mongoFilter(filter: string, schema?: any, options?: any): any {
    const res: any = {};
    const identifiers = schema ? schemaUtils.fields(schema) : null;
    const p = OdataParser.parse(filter, identifiers);
    if (p)
        _executeOdataFilterExpression(p, res, null, null, schema);
    return res;
}

const
    schemaUtils = {
        JSONTYPES: {
            integer: 'integer',
            boolean: 'boolean',
            string: 'string',
            number: 'number',
            array: 'array',
            object: 'object',
            date: 'date',
            datetime: 'date-time',
            json: 'json',
            text: 'memo',
            binary: 'stream'
        },
        fields: (schema: any): any => {
            return null;
        },
        typeOfProperty: (propName: string, schema: any): string => {
            return schemaUtils.JSONTYPES.string;
        },
        dbName: (propName: string, schema: any): string => {
            return propName;
        }

    };



function _escaperegex(value: string): string {
    return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}


function _tvalue(value: any, type: string | null, isJs: boolean): any {
    if (type === schemaUtils.JSONTYPES.date || type === schemaUtils.JSONTYPES.datetime) {
        if (value) {
            if (isJs) {
                if (type === schemaUtils.JSONTYPES.date)
                    value = datePart(value);
                return 'ISODate("' + value + '")';
            } else {
                if (type === schemaUtils.JSONTYPES.date) {
                    return parseISODate(value);
                } else {
                    return parseISODateTime(value);
                }
            }
        }
    }
    return value;
}


function _value(propName: string, schema: any, value: any, isJs: boolean, typeExp: string) {
    let type = schema ? schemaUtils.typeOfProperty(propName, schema) : null;
    if (typeExp === TokenType.array) {
        return value.map((cv: any) => {
            return _tvalue(cv.value, type, isJs);
        });
    } else {
        return _tvalue(value, type, isJs);
    }
}

function _checkIdentifier(propName: string, schema: any) {
    return propName;
}

function _translateIdentifier(propName: string, schema: any): string {
    return schemaUtils.dbName(propName, schema);

}


function _extractIdVal(c1: Expression, c2: Expression, schema: any): { left: Expression | null, right: Expression | null, c1: Expression, c2: Expression } {
    let res: { left: Expression | null, right: Expression | null, c1: Expression, c2: Expression } = { left: null, right: null, c1: c1, c2: c2 };
    if (c1.type === TokenType.identifier) {
        res.left = c1;
        res.left.value = _checkIdentifier(res.left.value, schema);
        if (c2.type === TokenType.literal || c2.type === TokenType.array) {
            res.right = c2;
            res.right.value = _value(res.left.value, schema, res.right.value, false, c2.type);
        }
        res.left.value = _translateIdentifier(res.left.value, schema);
    } else if (c2.type === TokenType.identifier) {
        res.left = c2;
        res.left.value = _checkIdentifier(res.left.value, schema);
        if (c1.type === TokenType.literal || c1.type === TokenType.array) {
            res.right = c1;
            res.right.value = _value(res.left.value, schema, res.right.value, false, c1.type);
        }
        res.left.value = _translateIdentifier(res.left.value, schema);
    } else if (c1.type === TokenType.literal && c2.type === TokenType.literal)
        throw new Error('Invalid filter (literal == literal).');
    return res;
}



function _executeOdataFilterExpression(exp: Expression, match: any, parentList: any[] | null, js: string[] | null, schema: any): boolean {
    if (!match && !parentList) return match;

    if (exp.type === TokenType.identifier) {
        if (js)
            js.push('this.' + exp.value);
    } else if (exp.type === TokenType.literal) {
        if (js) {
            js.push(JSON.stringify(exp.value));
        }
    } else if (exp.type === TokenType.operator) {
        switch (exp.value.code) {
            case 'and':
            case 'or':
                let alist = parentList;
                if (!alist) {
                    if (exp.value.code === 'and') {
                        match.$and = match.$and || [];
                        alist = match.$and;
                    } else {
                        match.$or = match.$or || [];
                        alist = match.$or;

                    }
                }
                exp.children && exp.children.forEach(function (child, index) {
                    if (js && index > 0)
                        js.push(exp.value.code === 'and' ? ' && ' : ' || ');
                    if (child.type === TokenType.operator && child.value.code === exp.value.code)
                        _executeOdataFilterExpression(child, null, alist, js, schema);
                    else {
                        let am = {};
                        alist && alist.push(am);
                        _executeOdataFilterExpression(child, am, null, js, schema);
                    }
                });
                break;
            default:
                _executeBinaryOperator(exp, match, js, schema);
                break;
        }

    } else if (exp.type === TokenType.func) {
        _execFunction(exp, match, js, schema);

    }
    return false;
}

function _executeBinaryOperator(exp: Expression, match: any, js: string[] | null, schema: any) {
    if (exp.children && exp.children.length > 1) {
        let d = _extractIdVal(exp.children[0], exp.children[1], schema);
        if (!d.left || !d.right)
            throw new Error(util.format('Invalid opertands for %s.', exp.value.code));
        switch (exp.value.code) {
            case '=':
                match[d.left.value] = d.right.value;
                break;
            case '<>':
                match[d.left.value] = { $ne: d.right.value };
                break;
            case '>':
                match[d.left.value] = (d.c1 === d.left) ? { $gt: d.right.value } : { $lte: d.left.value };
                break;
            case '<':
                match[d.left.value] = (d.c1 === d.left) ? { $lt: d.right.value } : { $gte: d.right.value };
                break;

            case '>=':
                match[d.left.value] = (d.c1 === d.left) ? { $gte: d.right.value } : { $lt: d.right.value };
                break;
            case '<=':
                match[d.left.value] = (d.c1 === d.left) ? { $lte: d.right.value } : { $gt: d.right.value };
                break;
            case 'in':
                match[d.left.value] = (d.c1 === d.left) ? { $in: d.right.value } : { $in: d.right.value };
                break;
            default:
                throw new Error(util.format('Operator not found %s.', exp.value.code));
        }
    }
}

function _execFunction(exp: Expression, match: any, js: string[] | null, schema: any) {

    switch (exp.value.name) {
        case 'contains':
            if (!exp.children) throw new Error('Invalid function contains.')
            let containsJsStarted = false;
            let containsJs = js;
            if (exp.children[0].type !== TokenType.identifier && !containsJs) {
                containsJs = [];
                containsJsStarted = true;
            }

            if (containsJs) {
                containsJs.push('(');
                _executeOdataFilterExpression(exp.children[0], match, null, containsJs, schema);
                containsJs.push('.indexOf(');
                _executeOdataFilterExpression(exp.children[1], match, null, containsJs, schema);
                containsJs.push(') >= 0)');
                if (containsJsStarted)
                    match.$where = containsJs.join('');
            } else {
                _executeOdataFilterExpression(exp.children[0], match, null, null, schema);
                _executeOdataFilterExpression(exp.children[1], match, null, null, schema);
                match[exp.children[0].value] = { $regex: _escaperegex(exp.children[1].value), $options: 'i' };
            }
            break;
        case 'startswith':
            if (!exp.children) throw new Error('Invalid function startswith.')
            let startswithJsStarted = false;
            let startswithJs = js;
            if (exp.children[0].type === TokenType.identifier && exp.children[1].type === TokenType.literal && !startswithJs) {
                startswithJs = [];
                startswithJsStarted = true;
            }
            if (startswithJs) {
                startswithJs.push('(');
                _executeOdataFilterExpression(exp.children[0], match, null, startswithJs, schema);
                startswithJs.push('.indexOf(');
                _executeOdataFilterExpression(exp.children[1], match, null, startswithJs, schema);
                startswithJs.push(') === 0)');
                if (startswithJsStarted)
                    match.$where = startswithJs.join('');
            } else {
                _executeOdataFilterExpression(exp.children[0], match, null, null, schema);
                _executeOdataFilterExpression(exp.children[1], match, null, null, schema);
                match[exp.children[0].value] = { $regex: '^' + new RegExp(_escaperegex(exp.children[1].value), 'i') };
            }
            break
        case 'endswith':
            if (!exp.children) throw new Error('Invalid function endswith.')
            let endswithJsStarted = false;
            let endswithJs = js || [];
            if (exp.children[0].type === TokenType.identifier && exp.children[1].type === TokenType.literal && !endswithJs) {
                endswithJs = [];
                endswithJsStarted = true;
            }
            if (endswithJsStarted) {
                endswithJs.push('(');
                _executeOdataFilterExpression(exp.children[0], match, null, endswithJs, schema);
                endswithJs.push('.endswith(');
                _executeOdataFilterExpression(exp.children[1], match, null, endswithJs, schema);
                endswithJs.push(')');
                if (endswithJsStarted)
                    match.$where = endswithJs.join('');
            } else {
                _executeOdataFilterExpression(exp.children[0], match, null, null, schema);
                _executeOdataFilterExpression(exp.children[1], match, null, null, schema);
                match[exp.children[0].value] = { $regex: new RegExp(_escaperegex(exp.children[1].value) + '$', 'i') };
            }

            break

        case 'tolower':
            if (!exp.children) throw new Error('Invalid function tolower.')
            let lowerJsStarted = !js;
            let lowerJs = js || [];
            _executeOdataFilterExpression(exp.children[0], match, null, lowerJs, schema);
            lowerJs.push('.toLowerCase()');
            if (lowerJsStarted)
                match.$where = lowerJs.join('');
            break
        case 'toupper':
            if (!exp.children) throw new Error('Invalid function toupper.')
            let upperJsStarted = !js;
            let upperJS = js || [];
            _executeOdataFilterExpression(exp.children[0], match, null, upperJS, schema);
            js && js.push('.toUpperCase()');
            upperJS.push('.toLowerCase()');
            if (upperJsStarted)
                match.$where = upperJS.join('');
            break
        default:
            throw new Error(util.format('Invalid function name %s.', exp.value.name));
    }

}






function _parseISODateTime(value: string, isDateTime: boolean): Date | undefined {
    if (!value) return undefined;
    let res = new Date(isDateTime ? value : value.substr(0, 10));
    if (Object.prototype.toString.call(res) === '[object Date]') {
        if (!isNaN(res.getTime()))
            return res;
    }
    throw new Error('Invalid Date');

}


function parseISODate(value: string): Date | undefined {
    return _parseISODateTime(value, false);
}

function parseISODateTime(value: string): Date | undefined {
    return _parseISODateTime(value, true);
}


function datePart(date: string): string {
    if (!date) return date;
    return new Date(date).toISOString().substr(0, 10);
}

