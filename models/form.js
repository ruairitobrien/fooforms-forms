/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var formSchema = Schema({
    displayName: {
        type: String,
        required: true,
        index: true
    },
    title: String,
    icon: String,
    description: String,
    btnLabel: String,
    settings: {},
    fields: [],
    version: Number,
    created: Date,
    lastModified: Date,
    postStream: [
        {type: Schema.Types.ObjectId, ref: 'PostStream'}
    ],
    url: String
});

formSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    if (!this.isNew) {
        if(!this.version){
            this.version = 0;
        }
        this.version += 1;
        this.lastModified = new Date();
        return next();
    }
    this.created = new Date();
    this.lastModified = new Date();
    return next();
});

formSchema.post('save', function () {
    try {
        if (this.wasNew) {
            //TODO: temporary solution hacked together for testing purposes
            // will probably end up being permanent, I just know it
            this.url = 'forms/repo/' + this._id;
            this.save();
        }
    } catch (err) {
        console.log(__filename, ' - ', err);
    }
});

module.exports = mongoose.model('Form', formSchema);

