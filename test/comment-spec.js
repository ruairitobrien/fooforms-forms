/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var should = require('should');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId();


var mockgoose = require('mockgoose');
mockgoose(mongoose);
var db = mongoose.connection;

var Comment = require('../models/comment')(db);

describe('Comment', function () {
    // Happy path
    describe('initializing a comment with default values', function () {
        var comment = {};

        var commenter = ObjectId;
        var content = 'some content';
        var commentStream = ObjectId;

        before(function (done) {
            mockgoose.reset();
            var testComment = new Comment({
                commenter: commenter,
                content: content,
                commentStream: commentStream
            });
            testComment.save(function (err, savedComment) {
                comment = savedComment;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('has content: ' + content, function () {
            comment.content.should.equal(content);
        });
        it('has 0 likes', function () {
            comment.likes.should.equal(0);
        });
        it('has 0 dislikes', function () {
            comment.dislikes.should.equal(0);
        });
        it('has 0 replies', function () {
            comment.replies.length.should.equal(0);
        });
        it('has the stream: ' + commentStream, function () {
            comment.commentStream.should.equal(commentStream);
        });
        it('has the commenter: ' + commenter, function () {
            comment.commenter.should.equal(commenter);
        });
        it('has a create date', function () {
            should.exist(comment.created);
        });
        it('has a last modified date', function () {
            should.exist(comment.lastModified);
        });
    });

    describe('initializing with some bad values', function () {

        var commenter = ObjectId;
        var content = 'a comment';
        var commentStream = ObjectId;


        beforeEach(function () {
            mockgoose.reset();
        });

        it('does not save without a commenter', function (done) {
            var testComment = new Comment({
                content: content,
                commentStream: commentStream});
            testComment.save(function (err, savedComment) {
                should.not.exist(savedComment);
                should.exist(err);
                err.name.should.equal('ValidationError');
                err.errors.commenter.type.should.equal('required');
                done();
            });
        });
        it('does not save without a stream', function (done) {
            var testComment = new Comment({
                commenter: commenter,
                content: content});
            testComment.save(function (err, savedComment) {
                should.not.exist(savedComment);
                should.exist(err);
                err.name.should.equal('ValidationError');
                err.errors.commentStream.type.should.equal('required');
                done();
            });
        });
        it('does not save without content', function (done) {
            var testComment = new Comment({
                commenter: commenter,
                commentStream: commentStream});
            testComment.save(function (err, savedComment) {
                should.not.exist(savedComment);
                should.exist(err);
                err.name.should.equal('ValidationError');
                err.errors.content.type.should.equal('required');
                done();
            });
        });

    });
});
