/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = Schema({
    content: String,
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
    stream: {
        type: Schema.Types.ObjectId,
        ref: 'CommentStream'
    },
    commenter: {
        type: Schema.Types.ObjectId,
        ref: 'User'
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


module.exports = mongoose.model('Comment', commentSchema);

