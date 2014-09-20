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

describe('Post', function () {
    // Happy path
    describe('initializing a post with default values', function () {
        var post = {};

        var postStream = ObjectId;

        before(function (done) {
            mockgoose.reset();
            var testPost = new Post({postStream: postStream});
            testPost.save(function (err, savedPost) {
                post = savedPost;
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

    describe('initializing with some realistic values', function () {
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
            var testPost = new Post({postStream: postStream, name: name,
                icon: icon, commentStream: commentStream, fields: fields});
            testPost.save(function (err, savedPost) {
                post = savedPost;
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

    describe('saving with bad values', function () {
        beforeEach(function () {
            mockgoose.reset();
        });
        it('does not save if postStream does not exist', function (done) {
            var testPost = new Post();
            testPost.save(function (err, post) {
                should.exist(err);
                should.not.exist(post);
                done();
            });
        });
    });
});
