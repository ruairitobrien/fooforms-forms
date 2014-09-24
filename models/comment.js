/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = Schema({
    content: {
        type: String,
        required: true
    },
    created: Date,
    lastModified: Date,
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    replies: [{
      type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    commentStream: {
        type: Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    commenter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

commentSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.lastModified = new Date();
        return next();
    }
    this.created = new Date();
    this.lastModified = new Date();
    next();
});

module.exports = function (dbConnection) {
    var Comment;
    try {
        Comment = dbConnection.model('Comment');
    } catch (err) {
        if(!Comment) {
            Comment = dbConnection.model('Comment', commentSchema);
        }
    }
    return Comment;
};

