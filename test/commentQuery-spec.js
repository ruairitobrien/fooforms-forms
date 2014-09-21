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
var CommentCommand = require('../lib/commentCommand');
var CommentQuery = require('../lib/commentQuery');

var compareComments = function (comment1, comment2) {
    comment1._id.should.eql(comment2._id);
    comment1.commenter.should.eql(comment2.commenter);
    comment1.content.should.equal(comment2.content);
    comment1.commentStream.should.eql(comment2.commentStream);
};


describe('Comment Queries', function () {
    // Happy path
    describe('finding a single comment', function () {

        var commentQuery = new CommentQuery(Comment);
        var commentCommand = new CommentCommand(Comment);
        var comment = {};

        var commenter = ObjectId;
        var content = 'some content';
        var commentStream = ObjectId;

        var invalidId = ObjectId;

        before(function (done) {
            mockgoose.reset();
            var testComment = {commentStream: commentStream, content: content, commenter: commenter};
            commentCommand.create(testComment, function (err, result) {
                comment = result.comment;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('finds an comment with id ' + comment._id, function (done) {
            commentQuery.findById(comment._id, function (err, result) {
                var doc = result.data;
                result.success.should.equal(true);
                should.exist(doc);
                compareComments(doc, doc);
                done(err);
            });
        });

        it('does not find an comment with id ' + invalidId, function (done) {
            commentQuery.findById(invalidId, function (err, result) {
                var doc = result.data;
                result.success.should.equal(false);
                should.not.exist(doc);
                done(err);
            });
        });
    });
});


