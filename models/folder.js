/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var folderSchema = Schema({
    displayName: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    readOnlyUsers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    organisation: {
        type: Schema.Types.ObjectId,
        ref: 'Organisation'
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    forms: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Form'
        }
    ],
    sharing: {},
    created: Date,
    lastModified: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});

folderSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.lastModified = new Date();
        return next();
    }
    this.created = new Date();
    this.lastModified = new Date();
    next();
});

module.exports = function (dbConnection) {
    var Folder;
    try {
        Folder = dbConnection.model('Folder');
    } catch (err) {
        if (!Folder) {
            Folder = dbConnection.model('Folder', folderSchema);
        }
    }
    return Folder;
};

