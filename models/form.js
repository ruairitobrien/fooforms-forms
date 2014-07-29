/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var log = require(global.config.modules.LOGGING).LOG;

var formSchema = Schema({
    displayName: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String
    },
    icon: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    btnLabel: {
        type: String,
        default: ''
    },
    settings: {},
    fields: [],
    version: Number,
    created: Date,
    lastModified: Date,
    stream: [
        {type: Schema.Types.ObjectId, ref: 'PostStream'}
    ],
    url: {
        type: String,
        default: ''
    },
    privileges: {
        type: String,
        default: 'User'
    }
});

formSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    if (!this.isNew) {
        this.version += 1;
        this.lastModified = new Date();
        return next();
    }
    this.version = 1;
    this.created = new Date();
    this.lastModified = new Date();
    next();
});

formSchema.post('save', function () {
    try {
        if (this.wasNew) {
            //TODO: temporary solution hacked together for testing purposes (will probably end up being permanent, I just know it)
            this.url = 'forms/repo/' + this._id;
            this.save(function (err) {
                if (err) {
                    log.error(__filename, ' - ', err);
                }
            });
        }
    } catch (err) {
        log.error(__filename, ' - ', err);
    }
});

module.exports = mongoose.model('Form', formSchema);

