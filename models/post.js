/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = Schema({
    name: String,
    icon: String,
    created: Date,
    lastModified: Date,
    postStream: { type: Schema.Types.ObjectId, ref: 'PostStream', required: true },
    commentStream: [ { type: Schema.Types.ObjectId, ref: 'PostStream' } ],
    fields: []
});

postSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.lastModified = new Date();
        return next();
    }
    this.created = new Date();
    this.lastModified = new Date();
    next();
});

module.exports = function (dbConnection) {
    var Post;
    try {
        Post = dbConnection.model('Post');
    } catch (err) {
        if(!Post) {
            Post = dbConnection.model('Post', postSchema);
        }
    }
    return Post;
};

