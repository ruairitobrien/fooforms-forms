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
var CommentStream = require('../models/commentStream')(db);
var PostStream = require('../models/postStream')(db);

var FooForm = require('../index');

describe('FooForm', function () {
    var fooForm = new FooForm(db);

    describe('Form Commands', function () {
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
        var folder;

        beforeEach(function (done) {
            mockgoose.reset();
            var folderDisplayName = 'aFolder';
            var folderModel = new Folder({displayName: folderDisplayName});
            folderModel.save(function (err, doc) {
                should.not.exist(err);
                folder = doc._id;
                var testForm = {
                    displayName: displayName, title: title, icon: icon,
                    description: description, btnLabel: btnLabel,
                    settings: settings, fields: fields, formEvents: formEvents,
                    folder: folder
                };
                fooForm.createForm(testForm, function (err, result) {
                    form = result.form;
                    done(err);
                });
            });
        });

        after(function () {
            mockgoose.reset();
        });

        it('updates a form', function (done) {
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
            form.displayName = displayNameUpdated;
            form.title = titleUpdated;
            form.icon = iconUpdated;
            form.description = descriptionUpdated;
            form.btnLabel = btnLabelUpdated;
            form.settings = settingsUpdated;
            form.fields = fieldsUpdated;
            form.formEvents = formEventsUpdated;
            fooForm.updateForm(form, function (err, result) {
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

        it('successfully deletes a form', function (done) {
            fooForm.deleteForm(form, function (err, result) {
                (result.success).should.equal(true);
                fooForm.findFormById(form._id, function (err, searchResult) {
                    should.not.exist(searchResult.form);
                    done(err);
                });
            });
        });

        it('successfully deletes a form by id', function (done) {
            fooForm.deleteForm({_id: form._id}, function (err, result) {
                (result.success).should.equal(true);
                fooForm.findFormById(form._id, function (err, searchResult) {
                    should.not.exist(searchResult.form);
                    done(err);
                });
            });
        });

        it('gives and error when deleting a form that does not exist', function (done) {
            fooForm.deleteForm({_id: ObjectId}, function (err, result) {
                (result.success).should.equal(false);
                should.exist(result.err);
                should.not.exist(result.form);
                done(err);
            });
        });
    });

    describe('Form Queries', function () {
        var form = {};

        var displayName = 'form';
        var invalidId = ObjectId;
        var folder;

        beforeEach(function (done) {
            mockgoose.reset();
            var folderDisplayName = 'aFolder';
            var folderModel = new Folder({displayName: folderDisplayName});
            folderModel.save(function (err, doc) {
                should.not.exist(err);
                folder = doc._id;
                var testForm = {
                    displayName: displayName,
                    folder: folder
                };
                fooForm.createForm(testForm, function (err, result) {
                    form = result.form;
                    done(err);
                });
            });
        });
        after(function () {
            mockgoose.reset();
        });

        it('finds an form with id ' + form._id, function (done) {
            fooForm.findFormById(form._id, function (err, result) {
                var doc = result.data;
                result.success.should.equal(true);
                should.exist(doc);
                doc._id.should.eql(form._id);
                done(err);
            });
        });

        it('does not find an form with id ' + invalidId, function (done) {
            fooForm.findFormById(invalidId, function (err, result) {
                var doc = result.data;
                result.success.should.equal(false);
                should.not.exist(doc);
                done(err);
            });
        });
    });

    describe('Post Commands', function () {
        var post = {};
        var postStream;
        var displayName = 'post';
        var icon = 'www.fooforms.com/icon.png';
        var fields = [
            {"something": {}},
            {"somethingElse": "test"},
            {},
            {}
        ];

        beforeEach(function (done) {
            mockgoose.reset();
            var postStreamModel = new PostStream();
            postStreamModel.save(function (err, doc) {
                should.not.exist(err);
                postStream = doc._id;
                var testPost = {postStream: postStream, displayName: displayName,
                    icon: icon, fields: fields};
                fooForm.createPost(testPost, function (err, result) {
                    post = result.post;
                    done(err);
                });
            });
        });
        after(function () {
            mockgoose.reset();
        });

        it('successfully deletes a post', function (done) {
            fooForm.deletePost(post, function (err, result) {
                (result.success).should.equal(true);
                fooForm.findPostById(post._id, function (err, searchResult) {
                    should.not.exist(searchResult.post);
                    done(err);
                });
            });
        });

        it('successfully deletes a post by id', function (done) {
            fooForm.deletePost({_id: post._id}, function (err, result) {
                (result.success).should.equal(true);
                fooForm.findPostById(post._id, function (err, searchResult) {
                    should.not.exist(searchResult.post);
                    done(err);
                });
            });
        });

        it('gives and error when deleting a post that does not exist', function (done) {
            fooForm.deletePost({_id: ObjectId}, function (err, result) {
                (result.success).should.equal(false);
                should.exist(result.err);
                should.not.exist(result.post);
                done(err);
            });
        });
        it('updates a post successfully', function (done) {
            var displayNameUpdated = 'updated displayName';
            var iconUpdated = 'http://www.fooforms.com/updated_icon.png';

            post.displayName = displayNameUpdated;
            post.icon = iconUpdated;

            fooForm.updatePost(post, function (err, result) {
                (result.success).should.equal(true);
                should.exist(result.post);
                result.post.displayName.should.equal(displayNameUpdated);
                result.post.icon.should.equal(iconUpdated);
                result.post.commentStreams.length.should.equal(1);
                result.post.fields.length.should.equal(fields.length);
                done(err);
            });
        });
        it('fails to update an post that does not exist', function (done) {
            fooForm.updatePost({_id: ObjectId, teams: [ObjectId, ObjectId]}, function (err, result) {
                (result.success).should.equal(false);
                should.not.exist(result.post);
                done(err);
            });
        });

    });

    describe('Post Queries', function () {
        var post = {};

        var displayName = 'post';
        var icon = 'www.fooposts.com/icon.png';
        var postStream;
        var fields = [
            {a: "a"},
            {b: "b"},
            {c: "c"}
        ];
        var invalidId = ObjectId;

        beforeEach(function (done) {
            mockgoose.reset();
            var postStreamModel = new PostStream();
            postStreamModel.save(function (err, doc) {
                should.not.exist(err);
                postStream = doc._id;
                var testPost = {postStream: postStream, displayName: displayName,
                    icon: icon, fields: fields};
                fooForm.createPost(testPost, function (err, result) {
                    post = result.post;
                    done(err);
                });
            });
        });
        after(function () {
            mockgoose.reset();
        });

        it('finds an post with id ' + post._id, function (done) {
            fooForm.findPostById(post._id, function (err, result) {
                var doc = result.data;
                result.success.should.equal(true);
                should.exist(doc);
                doc._id.should.eql(post._id);
                done(err);
            });
        });

        it('does not find an post with id ' + invalidId, function (done) {
            fooForm.findPostById(invalidId, function (err, result) {
                var doc = result.data;
                result.success.should.equal(false);
                should.not.exist(doc);
                done(err);
            });
        });
    });

    describe('Comment Commands', function () {
        var comment = {};

        var commenter = ObjectId;
        var content = 'some content';
        var commentStream;

        beforeEach(function (done) {
            mockgoose.reset();
            var commentStreamModel = new CommentStream();
            commentStreamModel.save(function (err, doc) {
                should.not.exist(err);
                commentStream = doc;
                var testComment = {commentStream: commentStream._id, content: content, commenter: commenter};
                fooForm.createComment(testComment, function (err, result) {
                    comment = result.comment;
                    done(err);
                });
            });

        });
        after(function () {
            mockgoose.reset();
        });

        it('successfully deletes a comment', function (done) {
            fooForm.deleteComment(comment, function (err, result) {
                (result.success).should.equal(true);
                fooForm.findCommentById(comment._id, function (err, searchResult) {
                    should.not.exist(searchResult.comment);
                    done(err);
                });
            });
        });

        it('successfully deletes a comment by id', function (done) {
            fooForm.deleteComment({_id: comment._id}, function (err, result) {
                (result.success).should.equal(true);
                fooForm.findCommentById(comment._id, function (err, searchResult) {
                    should.not.exist(searchResult.comment);
                    done(err);
                });
            });
        });

        it('gives and error when deleting a comment that does not exist', function (done) {
            fooForm.deleteComment({_id: ObjectId}, function (err, result) {
                (result.success).should.equal(false);
                should.exist(result.err);
                should.not.exist(result.comment);
                done(err);
            });
        });
    });

    describe('Comment Queries', function () {
        var comment = {};

        var commenter = ObjectId;
        var content = 'some content';
        var commentStream;

        var invalidId = ObjectId;

        beforeEach(function (done) {
            mockgoose.reset();
            var commentStreamModel = new CommentStream();
            commentStreamModel.save(function (err, doc) {
                should.not.exist(err);
                commentStream = doc;
                var testComment = {commentStream: commentStream._id, content: content, commenter: commenter};
                fooForm.createComment(testComment, function (err, result) {
                    comment = result.comment;
                    done(err);
                });
            });
        });
        after(function () {
            mockgoose.reset();
        });

        it('finds an comment with id ' + comment._id, function (done) {
            fooForm.findCommentById(comment._id, function (err, result) {
                var doc = result.data;
                result.success.should.equal(true);
                should.exist(doc);
                doc._id.should.eql(comment._id);
                done(err);
            });
        });

        it('does not find an comment with id ' + invalidId, function (done) {
            fooForm.findCommentById(invalidId, function (err, result) {
                var doc = result.data;
                result.success.should.equal(false);
                should.not.exist(doc);
                done(err);
            });
        });
    });
});
