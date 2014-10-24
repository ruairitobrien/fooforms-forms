/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var postSchema = Schema({
    displayName: String,
    title: String,
    icon: String,
    created: Date,
    createdBy: { type: Schema.Types.ObjectId },
    lastModified: Date,
    postStream: { type: Schema.Types.ObjectId, ref: 'PostStream', required: true },
    commentStream: { type: Schema.Types.ObjectId, ref: 'CommentStream' },
    fields: [],
    sharing: {},
    deleted: {
        type: Boolean,
        default: false
    }
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

postSchema.plugin(mongoosePaginate);

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

