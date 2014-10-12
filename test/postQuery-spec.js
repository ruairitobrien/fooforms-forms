/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var should = require('should');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId();
var async = require('async');

var mockgoose = require('mockgoose');
mockgoose(mongoose);
var db = mongoose.connection;

var Post = require('../models/post')(db);
var CommentStream = require('../models/commentStream')(db);
var PostStream = require('../models/postStream')(db);
var PostCommand = require('../lib/postCommand');
var PostQuery = require('../lib/postQuery');

var comparePosts = function (post1, post2) {
    post1._id.should.eql(post2._id);
    post1.displayName.should.equal(post2.displayName);
    post1.icon.should.equal(post2.icon);
    post1.postStream.should.eql(post2.postStream);
    post1.commentStreams.length.should.equal(post2.commentStreams.length);
    for (var i = 0; i < post1.commentStreams.length; i++) {
        post1.commentStreams[i].should.eql(post2.commentStreams[i]);
    }
    post1.fields.length.should.equal(post2.fields.length);
    for (var i = 0; i < post1.fields.length; i++) {
        post1.fields[i].should.equal(post2.fields[i]);
    }
};


describe('Post Queries', function () {
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
    describe('finding a single post', function () {

        var postQuery = new PostQuery(Post);
        var postCommand = new PostCommand(Post, CommentStream, PostStream);
        var post = {};

        var displayName = 'post';
        var icon = 'www.fooposts.com/icon.png';
        var fields = [{a: "a"},{b: "b"},{c: "c"}];

        var invalidId = ObjectId;

        before(function (done) {
            var testPost = {
                displayName: displayName, icon: icon,
                postStream: postStream,
                fields: fields
            };

            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
        });

        it('finds an post with id ' + post._id, function (done) {
            postQuery.findById(post._id, function (err, result) {
                var doc = result.data;
                result.success.should.equal(true);
                should.exist(doc);
                comparePosts(doc, doc);
                done(err);
            });
        });

        it('does not find an post with id ' + invalidId, function (done) {
            postQuery.findById(invalidId, function (err, result) {
                var doc = result.data;
                result.success.should.equal(false);
                should.not.exist(doc);
                done(err);
            });
        });

    });
});


