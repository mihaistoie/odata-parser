"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../index");
describe('Odata $filter to mongo Filter', function () {
    describe('#operators()', function () {
        it('Different from (not equal)', function () {
            let mf = index_1.$filter2mongoFilter('VAT_Bus_Posting_Group ne \'EXPORT\'');
            assert.deepEqual(mf, { VAT_Bus_Posting_Group: { $ne: 'EXPORT' } });
        });
        it('/', function () {
            let mf = index_1.$filter2mongoFilter('Address/city eq \'Paris\'');
            assert.deepEqual(mf, { 'Address.city': 'Paris' });
        });
        it('And', function () {
            let mf = index_1.$filter2mongoFilter('Country_Region_Code eq \'ES\' and Payment_Terms_Code eq \'14 DAYS\'');
            assert.deepEqual(mf, { $and: [{ Country_Region_Code: 'ES' }, { Payment_Terms_Code: '14 DAYS' }] });
            mf = index_1.$filter2mongoFilter('(Country_Region_Code eq \'ES\' and Payment_Terms_Code eq \'14 DAYS\') and VAT_Bus_Posting_Group ne \'EXPORT\'');
            assert.deepEqual(mf, { $and: [{ Country_Region_Code: 'ES' }, { Payment_Terms_Code: '14 DAYS' }, { VAT_Bus_Posting_Group: { $ne: 'EXPORT' } }] });
            mf = index_1.$filter2mongoFilter('(Country_Region_Code eq \'ES\' and Payment_Terms_Code eq \'14 DAYS\') and (VAT_Bus_Posting_Group ne \'EXPORT\')');
            assert.deepEqual(mf, { $and: [{ Country_Region_Code: 'ES' }, { Payment_Terms_Code: '14 DAYS' }, { VAT_Bus_Posting_Group: { $ne: 'EXPORT' } }] });
        });
        it('OR', function () {
            let mf = index_1.$filter2mongoFilter('Country_Region_Code eq \'ES\' or Country_Region_Code eq \'US\' or Country_Region_Code eq \'FR\'');
            assert.deepEqual(mf, { $or: [{ Country_Region_Code: 'ES' }, { Country_Region_Code: 'US' }, { Country_Region_Code: 'FR' }] });
            mf = index_1.$filter2mongoFilter('(((Country_Region_Code eq \'ES\') or ((Payment_Terms_Code eq \'14 DAYS\')) or VAT_Bus_Posting_Group ne \'EXPORT\'))');
            assert.deepEqual(mf, { $or: [{ Country_Region_Code: 'ES' }, { Payment_Terms_Code: '14 DAYS' }, { VAT_Bus_Posting_Group: { $ne: 'EXPORT' } }] });
        });
        it('Less than', function () {
            let mf = index_1.$filter2mongoFilter('Entry_No lt 610');
            assert.deepEqual(mf, { Entry_No: { $lt: 610 } });
        });
        it('Greater than', function () {
            let mf = index_1.$filter2mongoFilter('Entry_No gt 610 and Entry_No lt 600');
            assert.deepEqual(mf, { $and: [{ Entry_No: { $gt: 610 } }, { Entry_No: { $lt: 600 } }] });
            mf = index_1.$filter2mongoFilter('(Entry_No gt 610) and (Entry_No lt 600)');
            assert.deepEqual(mf, { $and: [{ Entry_No: { $gt: 610 } }, { Entry_No: { $lt: 600 } }] });
        });
        it('Greater than or equal to', function () {
            let mf = index_1.$filter2mongoFilter('Entry_No ge 610');
            assert.deepEqual(mf, { Entry_No: { $gte: 610 } });
        });
        it('In operator test1 ', function () {
            let mf = index_1.$filter2mongoFilter('Entry_No in (610, 200, 85)');
            assert.deepEqual(mf, { Entry_No: { $in: [610, 200, 85] } });
        });
        it('Less than or equal to', function () {
            let mf = index_1.$filter2mongoFilter('Entry_No le 610');
            assert.deepEqual(mf, { Entry_No: { $lte: 610 } });
        });
        it('contains', function () {
            let mf = index_1.$filter2mongoFilter('contains(CompanyName,\'Alfreds\')', null);
            assert.deepEqual(mf, { CompanyName: { $regex: 'Alfreds', $options: 'i' } });
            mf = index_1.$filter2mongoFilter('contains(Location/Address, \'San Francisco\')');
            assert.deepEqual(mf, { 'Location.Address': { $regex: 'San Francisco', $options: 'i' } });
        });
        it('date', function () {
            let mf1 = index_1.$filter2mongoFilter('d1 eq \'2014-03-11T00:10:01.000Z\' and d2 eq \'2015-10-01T00:10:01.000Z\'', null);
            let e1 = {
                $and: [
                    { d1: '2014-03-11T00:10:01.000Z' },
                    { d2: '2015-10-01T00:10:01.000Z' }
                ]
            };
            let mf2 = index_1.$filter2mongoFilter('d1 eq 2014-03-11T00:00:01.000Z and d2 eq 2015-10-01T00:10:01.000Z', null);
            assert.deepEqual(mf1, e1);
            e1 = {
                $and: [
                    { d1: '2014-03-11T00:00:01.000Z' },
                    { d2: '2015-10-01T00:10:01.000Z' }
                ]
            };
            assert.deepEqual(mf2, e1);
        });
        it('Dbname', function () {
            let mf = index_1.$filter2mongoFilter('id eq 610', null);
            assert.deepEqual(mf, { id: 610 });
        });
        it('Complex', function () {
            let mf = index_1.$filter2mongoFilter('(contains(tolower(commune), tolower(\'M\')) or contains(tolower(idcommune), tolower(\'M\'))  or contains(tolower(operation), tolower(\'M\')))');
            assert.deepEqual(mf, {
                $or: [
                    { $where: '(this.commune.toLowerCase().indexOf("M".toLowerCase()) >= 0)' },
                    { $where: '(this.idcommune.toLowerCase().indexOf("M".toLowerCase()) >= 0)' },
                    { $where: '(this.operation.toLowerCase().indexOf("M".toLowerCase()) >= 0)' }
                ]
            });
        });
    });
});
