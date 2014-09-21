"use strict";
var Emitter = require('events').EventEmitter;
var util = require('util');

var QueryResult = function (args) {
    return {
        args: args,
        success: false,
        err: null,
        message: null,
        data: null
    };
};

var CommentQuery = function (Comment) {
    Emitter.call(this);
    var self = this;
    var continueWith = null;

    var eventType = {
        idQuery: 'id-query',
        searchQuery: 'search-query',
        noResult: 'no-result',
        result: 'result'
    };

    var findById = function (queryResult) {
        Comment.findById(queryResult.args.id).lean().exec(function (err, doc) {
            if(err || !doc) {
                queryResult.err = err;
                notFound(queryResult);
            } else {
                queryResult.data = doc;
                found(queryResult);
            }
        });
    };

    var search = function (queryResult) {
        Comment.find(queryResult.args).lean().exec(function (err, docs) {
            if(err || !docs) {
                queryResult.err = err;
                notFound(queryResult);
            } else {
                queryResult.data = docs;
                found(queryResult);
            }
        });
    };

    var notFound = function (queryResult) {
        queryResult.success = false;
        queryResult.message = 'No Comment found';
        self.emit(eventType.noResult, queryResult);
        if(continueWith) {
            continueWith(null, queryResult);
        }
    };

    var found = function (queryResult) {
        queryResult.success = true;
        queryResult.message = 'Comment found';
        self.emit(eventType.result, queryResult);
        if(continueWith) {
            continueWith(null, queryResult);
        }
    };

    self.on(eventType.idQuery, findById);
    self.on(eventType.searchQuery, search);

    self.findById = function (id, next) {
        continueWith = next;
        var queryResult = new QueryResult({id: id});
        self.emit(eventType.idQuery, queryResult);
    };

    self.search = function (args, next) {
        continueWith = next;
        var queryResult = new QueryResult(args);
        self.emit(eventType.searchQuery, queryResult);
    };

    self.events = eventType;

    return self;
};

util.inherits(CommentQuery, Emitter);

module.exports = CommentQuery;
