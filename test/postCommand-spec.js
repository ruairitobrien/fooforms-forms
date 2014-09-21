/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var should = require('should');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId();

var mockgoose = require('mockgoose');
mockgoose(mongoose);
var db = mongoose.connection;

var Post = require('../models/post')(db);
var PostCommand = require('../lib/postCommand');


describe('Post Commands', function () {
    // Happy path
    describe('create a Post with defaults', function () {

        var postCommand = new PostCommand(Post);

        var post = {};

        var postStream = ObjectId;

        before(function (done) {
            mockgoose.reset();
            var testPost = {postStream: postStream};
            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
        });

        it('has the post stream: ' + postStream, function () {
            post.postStream.should.equal(postStream);
        });
        it('has no name', function () {
            should.not.exist(post.name);
        });
        it('has no icon', function () {
            should.not.exist(post.icon);
        });
        it('has no comment stream', function () {
            post.commentStream.length.should.equal(0);
        });
        it('has no fields', function () {
            post.fields.length.should.equal(0);
        });
        it('has a create date', function () {
            should.exist(post.created);
            post.created.should.be.instanceof(Date);
        });
        it('has a last modified date', function () {
            should.exist(post.lastModified);
            post.lastModified.should.be.instanceof(Date);
        });
    });

    describe('creating Post with most values', function () {
        var postCommand = new PostCommand(Post);


        var post = {};

        var postStream = ObjectId;
        var name = 'post';
        var icon = 'www.fooforms.com/icon.png';
        var commentStream = ObjectId;
        var fields = [
            {"something": {}},
            {"somethingElse": "test"},
            {},
            {}
        ];


        before(function (done) {
            mockgoose.reset();
            var testPost = {postStream: postStream, name: name,
                icon: icon, commentStream: commentStream, fields: fields};
            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
        });
        it('has the postStream: ' + postStream, function () {
            post.postStream.should.equal(postStream);
        });
        it('has the name: ' + name, function () {
            post.name.should.equal(name);
        });
        it('has the icon: ' + icon, function () {
            post.icon.should.equal(icon);
        });
        it('has the commentStream: ' + commentStream, function () {
            post.commentStream.length.should.equal(1);
            post.commentStream[0].should.equal(commentStream);
        });
        it('has the fields: ' + JSON.stringify(fields), function () {
            post.fields.length.should.equal(fields.length);
            var i;
            for (i = 0; i < post.fields.length; i++) {
                post.fields[i].should.equal(fields[i]);
            }
        });
    });

    describe('deleting a Post', function () {
        var postCommand = new PostCommand(Post);
        var post = {};
        var postStream = ObjectId;

        beforeEach(function (done) {
            mockgoose.reset();
            var testPost = {postStream: postStream};
            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('successfully deletes a post', function (done) {
            postCommand.deleteRecord(post, function (err, result) {
                (result.success).should.equal(true);
                Post.findById(post._id, function (err, doc) {
                    should.not.exist(doc);
                    done(err);
                });
            });
        });

        it('successfully deletes a post by id', function (done) {
            postCommand.deleteRecord({_id: post._id}, function (err, result) {
                (result.success).should.equal(true);
                Post.findById(post._id, function (err, doc) {
                    should.not.exist(doc);
                    done(err);
                });
            });
        });

        it('gives and error when deleting a post that does not exist', function (done) {
            postCommand.deleteRecord({_id: ObjectId}, function (err, result) {
                (result.success).should.equal(false);
                should.exist(result.err);
                should.not.exist(result.post);
                done(err);
            });
        });

    });

    describe('updating an Post', function () {
        var postCommand = new PostCommand(Post);


        var post = {};

        var postStream = ObjectId;
        var name = 'post';
        var icon = 'www.fooforms.com/icon.png';
        var commentStream = ObjectId;
        var fields = [
            {"something": {}},
            {"somethingElse": "test"},
            {},
            {}
        ];


        beforeEach(function (done) {
            mockgoose.reset();
            var testPost = {postStream: postStream};
            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('successfully updates an post mongoose object with valid values', function (done) {
            post.name = name;
            post.icon = icon;
            post.commentStream = commentStream;
            post.fields = fields;

            postCommand.update(post, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.post);
                result.post.name.should.equal(name);
                result.post.icon.should.equal(icon);
                result.post.commentStream[0].should.eql(commentStream);
                result.post.fields.length.should.equal(fields.length);
                done(err);
            });
        });

        it('successfully updates an post with valid values', function (done) {
            var customPost = {
                _id: post._id,
                icon: icon,
                name: name,
                commentStream: commentStream,
                fields: fields
            };

            postCommand.update(customPost, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.post);
                result.post.name.should.equal(name);
                result.post.icon.should.equal(icon);
                result.post.commentStream[0].should.eql(commentStream);
                result.post.fields.length.should.equal(fields.length);
                done(err);
            });
        });

        it('fails to update an post that does not exist', function (done) {
            postCommand.update({teams: [ObjectId, ObjectId]}, function (err, result) {
                (result.success).should.equal(false);
                should.not.exist(result.post);
                done(err);
            });
        });

    });

});


