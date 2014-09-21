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
var PostQuery = require('../lib/postQuery');

var comparePosts = function (post1, post2) {
    post1._id.should.eql(post2._id);
    post1.name.should.equal(post2.name);
    post1.icon.should.equal(post2.icon);
    post1.postStream.should.eql(post2.postStream);
    post1.commentStream.length.should.equal(post2.commentStream.length);
    for (var i = 0; i < post1.commentStream.length; i++) {
        post1.commentStream[i].should.eql(post2.commentStream[i]);
    }
    post1.fields.length.should.equal(post2.fields.length);
    for (var i = 0; i < post1.fields.length; i++) {
        post1.fields[i].should.equal(post2.fields[i]);
    }
};


describe('Post Queries', function () {
    // Happy path
    describe('finding a single post', function () {

        var postQuery = new PostQuery(Post);
        var postCommand = new PostCommand(Post);
        var post = {};

        var name = 'post';
        var icon = 'www.fooposts.com/icon.png';
        var postStream = ObjectId;
        var commentStream = ObjectId;
        var fields = [{a: "a"},{b: "b"},{c: "c"}];

        var invalidId = ObjectId;

        before(function (done) {
            mockgoose.reset();
            var testPost = {
                name: name, icon: icon,
                postStream: postStream, commentStream: commentStream,
                fields: fields
            };
            postCommand.create(testPost, function (err, result) {
                post = result.post;
                done(err);
            });
        });

        after(function () {
            mockgoose.reset();
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


