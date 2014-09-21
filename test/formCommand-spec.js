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


describe('Form Commands', function () {
    // Happy path
    describe('create a Form with defaults', function () {

        var formCommand = new FormCommand(Form);

        var form = {};

        var displayName = 'form';

        before(function (done) {
            mockgoose.reset();
            var testForm = {displayName: displayName};
            formCommand.create(testForm, function (err, result) {
                form = result.form;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });
        it('displayname is ' + displayName, function () {
            form.displayName.should.equal(displayName);
        });
        it('has no title', function () {
            should.not.exist(form.title);
        });
        it('has no icon', function () {
            should.not.exist(form.icon);
        });
        it('has no description', function () {
            should.not.exist(form.description);
        });
        it('has no button label', function () {
            should.not.exist(form.btnLabel);
        });
        it('has not settings', function () {
            should.not.exist(form.settings);
        });
        it('has no fields', function () {
            form.fields.length.should.equal(0);
        });
        it('has no stream', function () {
            should.not.exist(form.stream);
        });
        it('has a create date', function () {
            should.exist(form.created);
            form.created.should.be.instanceof(Date);
        });
        it('has a last modified date', function () {
            should.exist(form.lastModified);
            form.lastModified.should.be.instanceof(Date);
        });
        it('has a url', function () {
            should.exist(form.url);
        });
    });

    describe('creating Form with most values', function () {
        var formCommand = new FormCommand(Form);
        var form = {};

        var displayName = 'form';
        var title = 'form title';
        var icon = 'www.fooforms.com/icon.png';
        var description = 'the form description';
        var btnLabel = 'the button label';
        var formEvents = [
            {}
        ];
        var settings = {"setting": {}, "something": [], "something-else": "test"};
        var fields = [
            {},
            {},
            {}
        ];
        var postStream = ObjectId;

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
        it('has the display name: ' + displayName, function () {
            form.displayName.should.equal(displayName);
        });
        it('has the title: ' + title, function () {
            form.title.should.equal(title);
        });
        it('has the icon: ' + icon, function () {
            form.icon.should.equal(icon);
        });
        it('has the description: ' + description, function () {
            form.description.should.equal(description);
        });
        it('has the button label: ' + btnLabel, function () {
            form.btnLabel.should.equal(btnLabel);
        });
        it('has the settings: ' + JSON.stringify(settings), function () {
            form.settings.should.equal(settings);
        });
        it('has the events: ' + JSON.stringify(formEvents), function () {
            form.formEvents.length.should.equal(formEvents.length);
            var i;
            for (i = 0; i < form.formEvents.length; i++) {
                form.formEvents[i].should.equal(formEvents[i]);
            }
        });
        it('has the fields: ' + JSON.stringify(fields), function () {
            form.fields.length.should.equal(fields.length);
            var i;
            for (i = 0; i < form.fields.length; i++) {
                form.fields[i].should.equal(fields[i]);
            }
        });
        it('has the postStream: ' + postStream, function () {
            form.postStream.length.should.equal(1);
            form.postStream[0].should.equal(postStream);
        });
        it('has a url', function () {
            should.exist(form.url);
        });
        it('has a create date', function () {
            should.exist(form.created);
            form.created.should.be.instanceof(Date);
        });
        it('has a last modified date', function () {
            should.exist(form.lastModified);
            form.lastModified.should.be.instanceof(Date);
        });
        it('has a url', function () {
            should.exist(form.url);
        });
    });

    describe('deleting an Form', function () {
        var formCommand = new FormCommand(Form);
        var form = {};
        var displayName = 'form';

        beforeEach(function (done) {
            mockgoose.reset();
            var testForm = {displayName: displayName};
            formCommand.create(testForm, function (err, result) {
                form = result.form;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('successfully deletes a form', function (done) {
            formCommand.deleteRecord(form, function (err, result) {
                (result.success).should.equal(true);
                Form.findById(form._id, function (err, doc) {
                    should.not.exist(doc);
                    done(err);
                });
            });
        });

        it('successfully deletes a form by id', function (done) {
            formCommand.deleteRecord({_id: form._id}, function (err, result) {
                (result.success).should.equal(true);
                Form.findById(form._id, function (err, doc) {
                    should.not.exist(doc);
                    done(err);
                });
            });
        });

        it('gives and error when deleting a form that does not exist', function (done) {
            formCommand.deleteRecord({_id: ObjectId}, function (err, result) {
                (result.success).should.equal(false);
                should.exist(result.err);
                should.not.exist(result.form);
                done(err);
            });
        });

    });

    describe('updating an Form', function () {
        var formCommand = new FormCommand(Form);
        var form = {};

        var displayName = 'form';
        var title = 'form title';
        var icon = 'www.fooforms.com/icon.png';
        var description = 'the form description';
        var btnLabel = 'the button label';
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
        var formEvents = [
            {},
            {}
        ];
        var postStream = ObjectId;

        var displayNameUpdated = 'form_updated';
        var titleUpdated = 'updated form title';
        var iconUpdated = 'www.fooforms.com/icon2.png';
        var descriptionUpdated = 'updated description';
        var btnLabelUpdated = 'updated button label';
        var settingsUpdated = { "something": {}};
        var fieldsUpdated = [
            {},
            {}
        ];
        var formEventsUpdated = [
            {}
        ];

        beforeEach(function (done) {
            mockgoose.reset();
            var testForm = {
                displayName: displayName, title: title, icon: icon, description: description, btnLabel: btnLabel,
                settings: settings, fields: fields, formEvents: formEvents, postStream: postStream
            };
            formCommand.create(testForm, function (err, result) {
                form = result.form;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('successfully updates an form mongoose object with valid values', function (done) {
            form.displayName = displayNameUpdated;
            form.title = titleUpdated;
            form.icon = iconUpdated;
            form.description = descriptionUpdated;
            form.btnLabel = btnLabelUpdated;
            form.settings = settingsUpdated;
            form.fields = fieldsUpdated;
            form.formEvents = formEventsUpdated;

            formCommand.update(form, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.form);
                result.form.displayName.should.equal(displayNameUpdated);
                result.form.title.should.equal(titleUpdated);
                result.form.icon.should.equal(iconUpdated);
                result.form.description.should.equal(descriptionUpdated);
                result.form.btnLabel.should.equal(btnLabelUpdated);
                result.form.fields.length.should.equal(fieldsUpdated.length);
                result.form.formEvents.length.should.equal(formEventsUpdated.length);
                done(err);
            });
        });

        it('successfully updates an form with valid values', function (done) {
            var customForm = {
                _id: form._id,
                displayName: displayNameUpdated,
                title: titleUpdated,
                icon: iconUpdated,
                description: descriptionUpdated,
                btnLabel: btnLabelUpdated,
                settings: settingsUpdated,
                fields: fieldsUpdated,
                formEvents: formEventsUpdated
            };

            formCommand.update(customForm, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.form);
                result.form.displayName.should.equal(displayNameUpdated);
                result.form.title.should.equal(titleUpdated);
                result.form.icon.should.equal(iconUpdated);
                result.form.description.should.equal(descriptionUpdated);
                result.form.btnLabel.should.equal(btnLabelUpdated);
                result.form.fields.length.should.equal(fieldsUpdated.length);
                result.form.formEvents.length.should.equal(formEventsUpdated.length);
                done(err);
            });
        });

        it('fails to update an form that does not exist', function (done) {
            formCommand.update({teams: [ObjectId, ObjectId]}, function (err, result) {
                (result.success).should.equal(false);
                should.not.exist(result.form);
                done(err);
            });
        });

    });

});


