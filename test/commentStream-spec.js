/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var should = require('should');
var assert = require('assert');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId();
// Nasty hack for testing with mocha -w ... see: https://github.com/LearnBoost/mongoose/issues/1251
mongoose.models = {};
mongoose.modelSchemas = {};

var mockgoose = require('mockgoose');
mockgoose(mongoose);

var CommentStream = require('../models/commentStream');

describe('Comment Stream', function () {
    // Happy path
    describe('initializing a comment stream with default values', function () {
        var commentStream = {};

        before(function (done) {
            mockgoose.reset();
            var testCommentStream = new CommentStream();
            testCommentStream.save(function (err, savedCommentStream) {
                commentStream = savedCommentStream;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('has no comments', function () {
            commentStream.comments.length.should.equal(0);
        });
        it('has a create date', function () {
            should.exist(commentStream.created);
        });
        it('has a last modified date', function () {
            should.exist(commentStream.lastModified);
        });
    });

    describe('initializing with some realistic values', function () {
        var commentStream = {};
        var comments = [ObjectId, ObjectId, ObjectId];

        before(function (done) {
            mockgoose.reset();
            var testCommentStream = new CommentStream({comments: comments});
            testCommentStream.save(function (err, savedCommentStream) {
                commentStream = savedCommentStream;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('has ' + comments.length + ' comments', function () {
            commentStream.comments.length.should.equal(comments.length);
        });
        it('has a create date', function () {
            should.exist(commentStream.created);
        });
        it('has a last modified date', function () {
            should.exist(commentStream.lastModified);
        });
    });
});