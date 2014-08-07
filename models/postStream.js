/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postStreamSchema = Schema({
    created: Date,
    lastModified: Date,
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

postStreamSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.lastModified = new Date();
        return next();
    }
    this.created = new Date();
    this.lastModified = new Date();
    next();
});


module.exports = mongoose.model('PostStream', postStreamSchema);

