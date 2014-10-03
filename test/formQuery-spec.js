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
var PostStream = require('../models/postStream')(db);
var FormCommand = require('../lib/formCommand');
var FormQuery = require('../lib/formQuery');

var compareForms = function (form1, form2) {
    var i = 0;
    form1._id.should.eql(form2._id);
    form1.displayName.should.equal(form2.displayName);
    form1.title.should.equal(form2.title);
    form1.icon.should.equal(form2.icon);
    form1.description.should.equal(form2.description);
    form1.btnLabel.should.equal(form2.btnLabel);
    form1.formEvents.length.should.equal(form2.formEvents.length)
    for (i = 0; i < form1.formEvents.length; i++) {
        form1.formEvents[i].should.equal(form2.formEvents[i]);
    }
    form1.settings.should.equal(form2.settings);
    form1.fields.length.should.equal(form2.fields.length);
    for (i = 0; i < form1.fields.length; i++) {
        form1.fields[i].should.equal(form2.fields[i]);
    }
    form1.postStreams.length.should.equal(form2.postStreams.length);
    for (i = 0; i < form1.postStreams.length; i++) {
        form1.postStreams[i].should.eql(form2.postStreams[i]);
    }
    form1.folder.should.eql(form2.folder);

};


describe('Form Queries', function () {
    // Happy path
    describe('finding a single form', function () {

        var formQuery = new FormQuery(Form);
        var formCommand = new FormCommand(Form, PostStream);
        var form = {};

        var displayName = 'form';
        var title = 'form title';
        var icon = 'www.fooforms.com/icon.png';
        var description = 'the form description';
        var btnLabel = 'the button label';
        var formEvents = [{ hello: "hello"}];
        var settings = {
            "setting": {},
            "something": [],
            "something-else": "test"
        };
        var fields = [
            { name: "SomeName" },
            { thing: "someThing" },
            { bla: "bla" }
        ];
        var folder = ObjectId;

        var invalidId = ObjectId;

        before(function (done) {
            mockgoose.reset();
            var testForm = {
                displayName: displayName, title: title, icon: icon,
                description: description, btnLabel: btnLabel,
                settings: settings, fields: fields, formEvents: formEvents,
                folder: folder
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


