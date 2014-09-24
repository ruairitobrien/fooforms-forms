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
    formEvents: [],
    created: Date,
    lastModified: Date,
    postStreams: [
        {type: Schema.Types.ObjectId, ref: 'PostStream'}
    ],
    owner: {
        type: Schema.Types.ObjectId,
        required: true
    },
    private: {
        type: Boolean,
        default: false
    },
    url: String,
    sharing: {},
    deleted: {
        type: Boolean,
        default: false
    }
});

formSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    var now = new Date();
    if (!this.isNew) {
        this.lastModified = now;
        return next();
    }
    this.created = now;
    this.lastModified = now;
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

module.exports = function (dbConnection) {
    var Form;
    try {
        Form = dbConnection.model('Form');
    } catch (err) {
        if(!Form) {
            Form = dbConnection.model('Form', formSchema);
        }
    }
    return Form;
};

