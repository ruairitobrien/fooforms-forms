/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var should = require('should');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId();

var mockgoose = require('mockgoose');
mockgoose(mongoose);
var db = mongoose.connection;

var Form = require('../models/form')(db);
var FormCommand = require('../lib/formCommand');
var FormQuery = require('../lib/formQuery');

var compareForms = function (form1, form2) {
    form1._id.should.eql(form2._id);
    form1.displayName.should.equal(form2.displayName);

};


describe('Form Queries', function () {
    // Happy path
    describe('finding a single form', function () {

        var formQuery = new FormQuery(Form);
        var formCommand = new FormCommand(Form);
        var form = {};

        var displayName = 'form';
        var title = 'form title';
        var icon = 'www.fooforms.com/icon.png';
        var description = 'the form description';
        var btnLabel = 'the button label';
        var formEvents = [{}];
        var settings = {
            "setting": {},
            "something": [],
            "something-else": "test"
        };
        var fields = [
            {},
            {},
            {}
        ];
        var postStream = ObjectId;

        var invalidId = ObjectId;

        before(function (done) {
            mockgoose.reset();
            var testForm = {
                displayName: displayName, title: title, icon: icon,
                description: description, btnLabel: btnLabel,
                settings: settings, fields: fields, formEvents: formEvents,
                postStream: postStream
            };
            formCommand.create(testForm, function (err, result) {
                form = result.form;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('finds an form with id ' + form._id, function (done) {
            formQuery.findById(form._id, function (err, result) {
                var doc = result.data;
                result.success.should.equal(true);
                should.exist(doc);
                compareForms(doc, doc);
                done(err);
            });
        });

        it('does not find an form with id ' + invalidId, function (done) {
            formQuery.findById(invalidId, function (err, result) {
                var doc = result.data;
                result.success.should.equal(false);
                should.not.exist(doc);
                done(err);
            });
        });
    });

});


