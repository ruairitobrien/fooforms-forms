/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentStreamSchema = Schema({
    created: Date,
    lastModified: Date,
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    deleted: {
        type: Boolean,
        default: false
    }
});

commentStreamSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.lastModified = new Date();
        return next();
    }
    this.created = new Date();
    this.lastModified = new Date();
    next();
});

module.exports = function (dbConnection) {
    var CommentStream;
    try {
        CommentStream = dbConnection.model('CommentStream');
    } catch (err) {
        if(!CommentStream) {
            CommentStream = dbConnection.model('CommentStream', commentStreamSchema);
        }
    }
    return CommentStream;
};

