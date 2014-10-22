/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var should = require('should');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId();

var mockgoose = require('mockgoose');
mockgoose(mongoose);
var db = mongoose.connection;

var Folder = require('../models/folder')(db);

describe('Folder', function () {
    // Happy path
    describe('initializing a folder with default values', function () {
        var folder = {};

        var displayName = 'aFolder';

        before(function (done) {
            mockgoose.reset();
            var testFolder = new Folder({displayName: displayName});
            testFolder.save(function (err, savedFolder) {
                folder = savedFolder;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('has no forms', function () {
            folder.forms.length.should.equal(0);
        });
        it('has a create date', function () {
            should.exist(folder.created);
            folder.created.should.be.instanceof(Date);
        });
        it('has a last modified date', function () {
            should.exist(folder.lastModified);
            folder.lastModified.should.be.instanceof(Date);
        });
    });

    describe('initializing with some realistic values', function () {
        var folder = {};
        var displayName = 'aFolder';
        var icon = 'http://www.fooforms.com/icon.png';
        var forms = [ObjectId, ObjectId, ObjectId, ObjectId];
        var owner = ObjectId;
        var organisation = ObjectId;
        var readOnlyUsers = [ObjectId, ObjectId, ObjectId];

        before(function (done) {
            mockgoose.reset();
            var testFolder = new Folder({displayName: displayName, icon: icon,
                forms: forms, owner: owner, organisation: organisation, readOnlyUsers: readOnlyUsers});
            testFolder.save(function (err, savedFolder) {
                folder = savedFolder;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('has the displayName ' + displayName, function () {
           folder.displayName.should.equal(displayName);
        });
        it('has the icon ' + icon, function () {
           folder.icon.should.equal(icon);
        });
        it('has ' + forms.length + ' forms', function () {
            folder.forms.length.should.equal(forms.length);
        });
        it('has an organisation', function () {
            folder.organisation.should.eql(organisation);
        });
        it('has owners ' + owner, function () {
            folder.owner.should.eql(owner);
        });
        it('has ' + readOnlyUsers.length + ' read only users', function () {
            folder.readOnlyUsers.length.should.equal(readOnlyUsers.length);
        });
        it('has a create date', function () {
            should.exist(folder.created);
            folder.created.should.be.instanceof(Date);
        });
        it('has a last modified date', function () {
            should.exist(folder.lastModified);
            folder.lastModified.should.be.instanceof(Date);
        });
    });
});
