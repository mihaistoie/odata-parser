import * as assert from 'assert';
import { OdataParser } from '../index';




describe('Odata $filter OdataParser', () => {
    describe('#operators()', () => {
        it('Basic tests', () => {
            assert.equal(null, OdataParser.parseNe(''));
            assert.equal(null, OdataParser.parseNe('a eq \''));
            assert.notEqual(null, OdataParser.parse('a eq 1'));
            assert.notEqual(null, OdataParser.parse('Name eq \'Trip in US\''));
            assert.notEqual(null, OdataParser.parse('OrderDate eq datetime\'2014-03-11\''));


        });
        it('date filter', function () {
            assert.notEqual(null, OdataParser.parse('OrderDate eq \'2014-03-11\''))
            assert.notEqual(null, OdataParser.parse('OrderDate eq \'2015-10-01T00:00:00.000Z\''));
            assert.notEqual(null, OdataParser.parse('OrderDate eq 2014-03-11'))
            assert.notEqual(null, OdataParser.parse('OrderDate eq 11-03-2014'))
            assert.notEqual(null, OdataParser.parse('OrderDate eq 2015-10-01T00:00:00.000Z'));
        })
        it('Arithmetic Operators', function () {
            assert.notEqual(null, OdataParser.parseNe('(x add 4) eq 3'));
            assert.notEqual(null, OdataParser.parseNe('(x add y) eq 3'));
            assert.notEqual(null, OdataParser.parseNe('(x add y) eq z'));
            assert.notEqual(null, OdataParser.parseNe('(x div y) eq z'));
            assert.notEqual(null, OdataParser.parseNe('(x mul y) eq z'));
            assert.notEqual(null, OdataParser.parseNe('(x mod y) eq z'));
            assert.notEqual(null, OdataParser.parseNe('(x sub y) eq z'));
            assert.notEqual(null, OdataParser.parseNe('x eq 4.5'));
        });
        it('Grouping', function () {
            assert.notEqual(null, OdataParser.parse('Entry_No gt 610 and Entry_No le 600'));
            assert.notEqual(null, OdataParser.parse('(Entry_No gt 610) and (Entry_No le 600)'));
        });
        it('Select a range of values', function () {
            let p = OdataParser.parseNe('Entry_No gt 610 and Entry_No lt 615   ');
            assert.notEqual(null, p);
        });
        it('And', function () {
            assert.notEqual(null, OdataParser.parseNe('Country_Region_Code eq \'ES\' and Payment_Terms_Code eq \'14 DAYS\''));
        });
        it('Or', function () {
            assert.notEqual(null, OdataParser.parseNe('Country_Region_Code eq \'ES\' or Country_Region_Code eq \'US\''));
        });
        it('Complex Or', function () {
            assert.notEqual(null, OdataParser.parseNe('Country_Region_Code eq \'ES\' or Country_Region_Code eq \'US\' or Country_Region_Code eq \'FR\''));
        });

        it('Date equal ', function () {
            assert.notEqual(null, OdataParser.parseNe('startDate eq 01-12-2015'));
        });

        it('Not equal', function () {
            assert.notEqual(null, OdataParser.parseNe('VAT_Bus_Posting_Group ne \'EXPORT\''));
        });

        it('Less than', function () {
            assert.notEqual(null, OdataParser.parseNe('Entry_No lt 610'));
        });

        it('Greater than', function () {
            assert.notEqual(null, OdataParser.parseNe('Entry_No gt 610'));
        });

        it('Greater than or equal to', function () {
            assert.notEqual(null, OdataParser.parseNe('Entry_No ge 610'));
        });

        it('Less than or equal to', function () {
            assert.notEqual(null, OdataParser.parseNe('Entry_No le 610'));
        });

        it('endswith', function () {
            assert.notEqual(null, OdataParser.parseNe('endswith(VAT_Bus_Posting_Group,\'RT\')'));
        });
        it('startswith', function () {
            assert.notEqual(null, OdataParser.parseNe('startswith(Name, \'S\')'));
        });

        it('contains', function () {
            assert.notEqual(null, OdataParser.parse('contains(CompanyName,\'Alfreds\')'));
            assert.notEqual(null, OdataParser.parse('contains(Location/Address, \'San Francisco\')'));
        });
        it('length', function () {
            assert.notEqual(null, OdataParser.parseNe('length(CompanyName) eq 19'));
        });
        it('indexof', function () {
            assert.notEqual(null, OdataParser.parseNe('indexof(CompanyName,\'lfreds\') eq 1'));
        });
        it('substring', function () {
            assert.notEqual(null, OdataParser.parseNe('substring(CompanyName,1,2) eq \'lf\''));
        });
        it('tolower', function () {
            assert.notEqual(null, OdataParser.parseNe('tolower(CompanyName) eq \'alfreds futterkiste\''));
        });
        it('toupper', function () {
            assert.notEqual(null, OdataParser.parseNe('toupper(CompanyName) eq \'ALFREDS FUTTERKISTE\''));
        });

        it('trim', function () {
            assert.notEqual(null, OdataParser.parseNe('trim(CompanyName) eq CompanyName'));
        });

        it('in', function () {
            assert.notEqual(null, OdataParser.parseNe('code  in (\'a\', \'b\' \'c\')'));
        });
        it('in complex', function () {
            assert.notEqual(null, OdataParser.parseNe('toupper(CompanyName) eq \'ALFREDS FUTTERKISTE\' and code  in (1, 352.2 583)'));
        });

    });

})
