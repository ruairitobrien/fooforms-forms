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
    var Comment = require('./models/comment')(dbConnection);

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

    /*******************************************************************************************************************
     * FORM COMMANDS
     */

    self.createForm = function () {

    };

    self.updatedForm = function () {

    };

    self.deleteForm = function () {

    };

    /*******************************************************************************************************************
     * FORM QUERIES
     */

    self.findFormById = function() {

    };

    /*******************************************************************************************************************
     * POST COMMANDS
     */
    self.createPost = function () {

    };

    self.updatedPost = function () {

    };

    self.deletePost = function () {

    };

    /*******************************************************************************************************************
     * POST QUERIES
     */
    self.findPostById = function () {

    };

    /*******************************************************************************************************************
     * COMMENT COMMANDS
     */
    self.createComment = function () {

    };

    self.updatedComment = function () {

    };

    self.deleteComment = function () {

    };

    /*******************************************************************************************************************
     * COMMENT QUERIES
     */
    self.findCommentById = function () {

    };


};

util.inherits(FooForm, Emitter);

module.exports = FooForm;
