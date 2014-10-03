"use strict";
var Emitter = require('events').EventEmitter;
var util = require('util');

var FormQuery = require('./lib/formQuery');
var FormCommand = require('./lib/formCommand');
var PostQuery = require('./lib/postQuery');
var PostCommand = require('./lib/postCommand');
var CommentQuery = require('./lib/commentQuery');
var CommentCommand = require('./lib/commentCommand');


var FooForm = function (dbConnection) {
    Emitter.call(this);
    var self = this;

    var Form = require('./models/form')(dbConnection);
    var Post = require('./models/post')(dbConnection);
    var Folder = require('./models/folder')(dbConnection);
    var Comment = require('./models/comment')(dbConnection);
    var PostStream = require('./models/postStream')(dbConnection);
    var CommentStream = require('./models/commentStream')(dbConnection);

    var _formQuery = new FormQuery(Form);
    var _postQuery = new PostQuery(Post);
    var _commentQuery = new CommentQuery(Comment);

    // TODO: make this expose events in the API
    var eventTypes = {

    };

    self.events = eventTypes;

    /**
     * Expose models in case they are needed
     */
    self.Form = Form;
    self.Post = Post;
    self.Comment = Comment;
    self.Folder = Folder;

    /*******************************************************************************************************************
     * FORM COMMANDS
     */

    self.createForm = function (form, next) {
        var formCommand = new FormCommand(Form, PostStream, Post, CommentStream, Comment);
        formCommand.create(form, next);
    };

    self.updateForm = function (form, next) {
        var formCommand = new FormCommand(Form, PostStream, Post, CommentStream, Comment);
        formCommand.update(form, next);
    };

    self.deleteForm = function (form, next) {
        var formCommand = new FormCommand(Form, PostStream, Post, CommentStream, Comment);
        formCommand.deleteRecord(form, next);
    };

    /*******************************************************************************************************************
     * FORM QUERIES
     */

    self.findFormById = function (id, next) {
        _formQuery.findById(id, next);
    };

    /*******************************************************************************************************************
     * POST COMMANDS
     */
    self.createPost = function (post, next) {
        var postCommand = new PostCommand(Post, CommentStream, PostStream, Comment);
        postCommand.create(post, next);
    };

    self.updatePost = function (post, next) {
        var postCommand = new PostCommand(Post, CommentStream, PostStream, Comment);
        postCommand.update(post, next);
    };

    self.deletePost = function (post, next) {
        var postCommand = new PostCommand(Post, CommentStream, PostStream, Comment);
        postCommand.deleteRecord(post, next);
    };

    /*******************************************************************************************************************
     * POST QUERIES
     */
    self.findPostById = function (id, next) {
        _postQuery.findById(id, next);
    };

    /*******************************************************************************************************************
     * COMMENT COMMANDS
     */
    self.createComment = function (comment, next) {
        var commentCommand = new CommentCommand(Comment, CommentStream);
        commentCommand.create(comment, next);
    };

    self.updateComment = function (comment, next) {
        var commentCommand = new CommentCommand(Comment, CommentStream);
        commentCommand.update(comment, next);
    };

    self.deleteComment = function (comment, next) {
        var commentCommand = new CommentCommand(Comment, CommentStream);
        commentCommand.deleteRecord(comment, next);
    };

    /*******************************************************************************************************************
     * COMMENT QUERIES
     */
    self.findCommentById = function (id, next) {
        _commentQuery.findById(id, next);
    };


};

util.inherits(FooForm, Emitter);

module.exports = FooForm;
