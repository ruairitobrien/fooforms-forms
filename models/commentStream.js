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
    }]
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


module.exports = mongoose.model('CommentStream', commentStreamSchema);

