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
var CommentStream = require('../models/commentStream')(db);
var CommentCommand = require('../lib/commentCommand');


describe('Comment Commands', function () {
    var commentStream;
    before(function (done) {
        mockgoose.reset();
        var commentStreamModel = new CommentStream();
        commentStreamModel.save(function (err, doc) {
            should.not.exist(err);
            should.exist(doc._id);
            commentStream = doc;
            done();
        });
    });
    after(function () {
        mockgoose.reset();
    });

    // Happy path
    describe('create a Comment with defaults', function () {

        var commentCommand = new CommentCommand(Comment, CommentStream);

        var comment = {};

        var commenter = ObjectId;
        var content = 'some content';

        before(function (done) {
            var testComment = {commentStream: commentStream._id, content: content, commenter: commenter};
            commentCommand.create(testComment, function (err, result) {
                comment = result.comment;
                done(err);
            });
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
        it('has a stream ', function () {
            comment.commentStream.should.eql(commentStream._id);
        });
        it('is in the comment stream', function (done) {
            CommentStream.findById(comment.commentStream, function (err, doc) {
                should.not.exist(err);
                should.exist(doc);
                doc.comments.length.should.equal(1);
                (doc.comments.indexOf(comment._id) > -1).should.equal(true);
                done(err);
            });
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

    describe('deleting a Comment', function () {
        var commentCommand = new CommentCommand(Comment, CommentStream);
        var comment = {};
        var commenter = ObjectId;
        var content = 'some content';

        beforeEach(function (done) {
            var testComment = {commentStream: commentStream._id, content: content, commenter: commenter};
            commentCommand.create(testComment, function (err, result) {
                comment = result.comment;
                done(err);
            });
        });

        it('successfully deletes a comment', function (done) {
            commentCommand.deleteRecord(comment, function (err, result) {
                (result.success).should.equal(true);
                Comment.findById(comment._id, function (err, doc) {
                    should.not.exist(doc);
                    done(err);
                });
            });
        });

        it('successfully deletes a comment by id', function (done) {
            commentCommand.deleteRecord({_id: comment._id}, function (err, result) {
                (result.success).should.equal(true);
                Comment.findById(comment._id, function (err, doc) {
                    should.not.exist(doc);
                    done(err);
                });
            });
        });

        it('is gone from the comment stream', function (done) {
            commentCommand.deleteRecord({_id: comment._id}, function (err, result) {
                (result.success).should.equal(true);
                CommentStream.findById(comment.commentStream, function (err, stream) {
                    should.not.exist(err);
                    (stream.comments.indexOf(comment) < 0).should.equal(true);
                    Comment.findById(comment._id, function (err, doc) {
                        should.not.exist(doc);
                        done(err);
                    });
                });
            });
        });

        it('gives and error when deleting a comment that does not exist', function (done) {
            commentCommand.deleteRecord({_id: ObjectId}, function (err, result) {
                (result.success).should.equal(false);
                should.exist(result.err);
                should.not.exist(result.comment);
                done(err);
            });
        });
    });

    describe('updating an Comment', function () {
        var commentCommand = new CommentCommand(Comment, CommentStream);
        var comment = {};
        var commenter = ObjectId;
        var content = 'some content';

        var contentUpdated = 'updated content';

        beforeEach(function (done) {
            var testComment = {commentStream: commentStream._id, content: content, commenter: commenter};
            commentCommand.create(testComment, function (err, result) {
                comment = result.comment;
                done(err);
            });
        });

        it('successfully updates an comment mongoose object with valid values', function (done) {
            comment.content = contentUpdated;

            commentCommand.update(comment, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.comment);
                result.comment._id.should.eql(comment._id);
                result.comment.content.should.equal(contentUpdated);
                result.comment.commentStream.should.eql(comment.commentStream);
                result.comment.commenter.should.eql(comment.commenter);
                done(err);
            });
        });

        it('successfully updates an comment with valid values', function (done) {
            var customCommand = {
                _id: comment._id,
                content: contentUpdated
            };

            commentCommand.update(customCommand, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.comment);
                result.comment._id.should.eql(comment._id);
                result.comment.content.should.equal(contentUpdated);
                result.comment.commentStream.should.eql(comment.commentStream);
                result.comment.commenter.should.eql(comment.commenter);
                done(err);
            });
        });

        it('fails to update an comment that does not exist', function (done) {
            commentCommand.update({commentStream: [ObjectId, ObjectId]}, function (err, result) {
                (result.success).should.equal(false);
                should.not.exist(result.comment);
                done(err);
            });
        });

    });

});


