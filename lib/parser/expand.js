"use strict";
/*
import * as util from 'util';
import {http as httpUtils}  from '../../utils/index';
import {schema as schemaUtils} from '../../schema/index';

const
    invalidCharAt = 'Invalid char "%s" at position %d (%s)';


export function parseExpandString(value: string, separator: string) {
    let res = {};
    let inString: string = '';
    let inIdentifier = false;
    let inArg = false;
    let pCount = 0;
    let ci = [];
    let ca = [];

    for (let i = 0, len = value.length; i < len; i++) {
        let c = value.charAt(i);
        switch (c) {
            case ' ':
            case '\t':
            case '\r':
            case '\n':
                if (inArg)
                    ca.push(c)
                break;
            case '(':
                if (inString)
                    ca.push(c);
                else {
                    pCount++;
                    if (pCount === 1) {
                        if (!inIdentifier || ci.length === 0)
                            throw new httpUtils.HttpError(util.format(invalidCharAt, c, i, value));
                        res[ci.join('')] = {};
                        inIdentifier = false;
                        inArg = true;
                    } else {
                        if (!inArg) throw new httpUtils.HttpError(util.format(invalidCharAt, c, i, value));
                        ca.push(c);
                    }
                }
                break;
            case ')':
                if (!inArg) throw new httpUtils.HttpError(util.format(invalidCharAt, c, i, value));
                if (inString)
                    ca.push(c);
                else {
                    pCount--;
                    if (pCount === 0) {
                        inArg = false;
                        res[ci.join('')].args = ca.join('');
                        ci = [];
                        ca = [];
                    } else {
                        ca.push(c);
                    }
                }
                break;
            default:
                if (inString) {
                    if (inString === c) {
                        if (value.charAt(i - 1) !== '\\') {
                            inString = '';
                        }
                    }
                    ca.push(c)
                    break;
                }
                if (separator === c) {
                    if (inArg) {
                        ca.push(c);
                        break;
                    }
                    if (inIdentifier) {
                        res[ci.join('')] = {};
                        ci = [];
                        inIdentifier = false;
                        break;
                    }
                    break;
                }

                if (inArg) {
                    if (!inString && c === '\'') {
                        inString = c;
                    }
                    ca.push(c);
                    break;
                }

                if (!inIdentifier) {
                    inIdentifier = true;
                    ci.push(c);
                    break;
                } else if (inIdentifier) {
                    ci.push(c);
                }
                break;
        }

    }

    if (inIdentifier && ci.length) {
        res[ci.join('')] = {};
    }
    if (inArg) {
        throw new httpUtils.HttpError("Unexpected terminated string: " + value);
    }
    Object.keys(res).forEach(function (kn: string) {
        if (res[kn].args) {
            res[kn] = parseExpandArg(res[kn].args, ';');
        }
    });
    return res;

}


function parseExpandArg(value: string, separator: string) {
    let res: any = {};
    let inString: string = '';
    let inIdentifier = false;
    let inArg = false;
    let ci = [];
    let ca = [];
    let pCount = 0;

    for (let i = 0, len = value.length; i < len; i++) {
        let c = value.charAt(i);
        switch (c) {
            case ' ':
            case '\t':
            case '\r':
            case '\n':
                if (inArg)
                    ca.push(c)
                break;
            case '=':
                if (inArg) {
                    ca.push(c);
                    if (!inString) pCount++;

                } else {
                    pCount++;
                    if (pCount === 1) {
                        if (!inIdentifier || ci.length === 0) {
                            throw new httpUtils.HttpError(util.format(invalidCharAt, c, i, value));
                        }
                        inArg = true;
                        inIdentifier = false;
                    } else
                        throw new httpUtils.HttpError(util.format(invalidCharAt, c, i, value));
                }
                break;
            default:
                if (inString) {
                    if (inString === c) {
                        if (value.charAt(i - 1) !== '\\') {
                            inString = '';
                        }
                    }
                    ca.push(c)
                    break;
                }
                if (separator === c) {
                    if (inArg) {
                        pCount--;
                        if (pCount === 0) {
                            res[ci.join('')] = ca.join('')
                            inArg = false;
                            ci = [];
                            ca = [];
                        } else
                            ca.push(c);
                    } else if (inIdentifier) {
                        throw new httpUtils.HttpError(util.format(invalidCharAt, c, i, value));
                    }
                    break;
                }

                if (inArg) {
                    if (!inString && c === '\'') {
                        inString = c;
                    }
                    ca.push(c);
                    break;
                }

                if (!inIdentifier) {
                    inIdentifier = true;
                    ci.push(c);
                    break;
                } else if (inIdentifier) {
                    ci.push(c);
                }
                break;
        }

    }

    if (inIdentifier && ci.length) {
        throw new httpUtils.HttpError("Unexpected terminated string(2) : " + value);
    }
    if (inArg) {
        if (!ci.length) {
            throw new httpUtils.HttpError("Unexpected terminated string(3): " + value);
        }
        res[ci.join('')] = ca.join('');
    }
    if (res.$expand) {
        res.$expand = parseExpandString(res.$expand, ',');
    }
    return res;

}

export function exploreExpand(expand: any, prefix: string, entities: any, schema: any, cb: (items: { relation: any, internalPath: string, relationName: string, propName: string, refSchema: any, expand: any }[]) => void): void {
    if (expand.$expand) {
        var toExpands = [];
        var toExplore = [];
        Object.keys(expand.$expand).forEach(function (propName: string) {
            let segments = propName.split('/');
            let relName = segments.pop();
            let cs = schema;
            let internalPath = '';
            if (segments.length) {
                internalPath = segments.join('.');
                cs = schemaUtils.path2schema(internalPath, cs, true);
                if (!cs)
                    throw new httpUtils.HttpError(util.format('Invalid $expand. Relation not found: \'%s\'.', propName));
            }
            let propDef = cs.properties[propName];
            if (!propDef) {
                let relation = cs.relations ? cs.relations[relName] : null;
                if (!relation || relation.isHidden)
                    throw new httpUtils.HttpError(util.format('Invalid $expand. Relation not found: \'%s\'.', propName));
                let refEntity = entities[relation.foreignEntity];
                let ce = expand.$expand[propName];
                toExpands.push({ relation: relation, relationName: relName, internalPath: internalPath, refSchema: refEntity, expand: ce });
                if (ce.$expand) {
                    toExplore.push({ expand: ce, prefix: schemaUtils.addPrefix(prefix, propName), schema: refEntity });
                }
            }
        });
        if (toExpands.length)
            cb(toExpands);
        toExplore.forEach(function (item) {
            exploreExpand(item.expand, item.prefix, entities, item.scheama, cb);
        })
    }
}

export function addAutoExpand(queryExpand: string, schema: any, prefer: boolean): string {
    let expands = [];
    let queryExpandParsed = queryExpand ? parseExpandString(queryExpand, ',') : null;
    Object.keys(schema.properties).forEach(key => {
        let p = schema.properties[key];
        let type = p.type ? p.type.toLowerCase() : null;
        if (type && (type == "object" || type == "array") && (prefer || p.expand)) {
            if (!queryExpandParsed || (queryExpandParsed && !queryExpandParsed.hasOwnProperty(key)))
                expands.push(key);
        }
    });
    if (!queryExpand && !expands.length) return undefined;
    return (queryExpand ? queryExpand + (expands.length ? ",": "") : "") + expands.join(",");
}



*/ 
