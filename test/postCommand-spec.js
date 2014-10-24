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
var Comment = require('../models/comment')(db);
var CommentStream = require('../models/commentStream')(db);
var PostStream = require('../models/postStream')(db);
var PostCommand = require('../lib/postCommand');
var CommentCommand = require('../lib/commentCommand');


describe('Post Commands', function () {

    var postStream;
    before(function (done) {
        mockgoose.reset();
        var postStreamModel = new PostStream();
        postStreamModel.save(function (err, doc) {
            should.not.exist(err);
            should.exist(doc._id);
            postStream = doc._id;
            done();
        });
    });
    after(function () {
        mockgoose.reset();
    });
    // Happy path
    describe('create a Post with defaults', function () {

        var postCommand = new PostCommand(Post, CommentStream, PostStream, Comment);

        var post = {};

        before(function (done) {
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
        it('has a comment stream', function () {
            should.exist(post.commentStream);
        });
        it('is in the post stream', function (done) {
            PostStream.findById(post.postStream, function (err, doc) {
                should.not.exist(err);
                (doc.posts.indexOf(post._id) > -1).should.equal(true);
                done();
            });
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
        var postCommand = new PostCommand(Post, CommentStream, PostStream, Comment);


        var post = {};

        var displayName = 'post';
        var icon = 'www.fooforms.com/icon.png';
        var fields = [
            {"something": {}},
            {"somethingElse": "test"},
            {},
            {}
        ];


        before(function (done) {
            var testPost = {postStream: postStream, displayName: displayName,
                icon: icon, fields: fields};
            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
        });
        it('has the postStream: ' + postStream, function () {
            post.postStream.should.equal(postStream);
        });
        it('has the displayName: ' + displayName, function () {
            post.displayName.should.equal(displayName);
        });
        it('has the icon: ' + icon, function () {
            post.icon.should.equal(icon);
        });
        it('has a commentStream ', function () {
            should.exist(post.commentStream);
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
        var postCommand = new PostCommand(Post, CommentStream, PostStream, Comment);
        var post = {};

        beforeEach(function (done) {
            var testPost = {postStream: postStream};
            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
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

        it('is gone from the post stream', function (done) {
            postCommand.deleteRecord({_id: post._id}, function (err, result) {
                (result.success).should.equal(true);
                Post.findById(post._id, function (err, deletedPost) {
                    should.not.exist(err);
                    should.not.exist(deletedPost);
                    PostStream.findById(post.postStream, function (err, doc) {
                        should.not.exist(err);
                        (doc.posts.indexOf(post._id) < 0).should.equal(true);
                        done(err);
                    });
                });
            });
        });

        it('deletes comments in comment stream when deleted', function (done) {
            var commentCommand = new CommentCommand(Comment, CommentStream);
            var comment = {};
            var commenter = ObjectId;
            var content = 'some content';
            var testComment = {commentStream: post.commentStream, content: content, commenter: commenter};

            commentCommand.create(testComment, function (err, result) {
                should.not.exist(err);
                result.success.should.equal(true);
                comment = result.comment;
                postCommand.deleteRecord({_id: post._id}, function (err, result) {
                    result.success.should.equal(true);
                    Post.findById(post._id, function (err, doc) {
                        should.not.exist(err);
                        should.not.exist(doc);
                        Comment.findById(comment._id, function (err, deletedComment) {
                            should.not.exist(deletedComment);
                            done(err);
                        });
                    });
                });
            });
        });

    });

    describe('updating an Post', function () {
        var postCommand = new PostCommand(Post, CommentStream, PostStream, Comment);

        var post = {};

        var displayName = 'post';
        var icon = 'www.fooforms.com/icon.png';
        var fields = [
            {"something": {}},
            {"somethingElse": "test"},
            {},
            {}
        ];

        beforeEach(function (done) {
            var testPost = {postStream: postStream};
            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
        });

        it('successfully updates an post mongoose object with valid values', function (done) {
            post.displayName = displayName;
            post.icon = icon;
            post.fields = fields;

            postCommand.update(post, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.post);
                result.post.displayName.should.equal(displayName);
                result.post.icon.should.equal(icon);
                should.exist(result.post.commentStream);
                result.post.fields.length.should.equal(fields.length);
                done(err);
            });
        });

        it('successfully updates an post with valid values', function (done) {
            var customPost = {
                _id: post._id,
                icon: icon,
                displayName: displayName,
                fields: fields
            };

            postCommand.update(customPost, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.post);
                result.post.displayName.should.equal(displayName);
                result.post.icon.should.equal(icon);
                should.exist(result.post.commentStream);
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


