/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var should = require('should');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId();

var mockgoose = require('mockgoose');
mockgoose(mongoose);
var db = mongoose.connection;

var PostStream = require('../models/postStream')(db);

describe('Post Stream', function () {
    // Happy path
    describe('initializing a post stream with default values', function () {
        var postStream = {};

        before(function (done) {
            mockgoose.reset();
            var testPostStream = new PostStream();
            testPostStream.save(function (err, savedPostStream) {
                postStream = savedPostStream;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('has no posts', function () {
            postStream.posts.length.should.equal(0);
        });
        it('has a create date', function () {
            should.exist(postStream.created);
            postStream.created.should.be.instanceof(Date);
        });
        it('has a last modified date', function () {
            should.exist(postStream.lastModified);
            postStream.lastModified.should.be.instanceof(Date);
        });
    });

    describe('initializing with some realistic values', function () {
        var postStream = {};
        var posts = [ObjectId, ObjectId, ObjectId, ObjectId];

        before(function (done) {
            mockgoose.reset();
            var testPostStream = new PostStream({posts: posts});
            testPostStream.save(function (err, savedPostStream) {
                postStream = savedPostStream;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('has ' + posts.length + ' comments', function () {
            postStream.posts.length.should.equal(posts.length);
        });
        it('has a create date', function () {
            should.exist(postStream.created);
            postStream.created.should.be.instanceof(Date);
        });
        it('has a last modified date', function () {
            should.exist(postStream.lastModified);
            postStream.lastModified.should.be.instanceof(Date);
        });
    });
});
