"use strict";
var Emitter = require('events').EventEmitter;
var util = require('util');

var CommandResult = function (args) {
    return {
        args: args,
        success: false,
        message: 'Invalid arguments',
        err: null,
        form: null
    };
};

var FormCommand = function (Form) {
    Emitter.call(this);
    var self = this;
    var continueWith = null;

    var eventType = {
        createCommand: 'create-form-command',
        updateCommand: 'update-form-command',
        deleteCommand: 'delete-form-command',
        createError: 'create-form-error',
        updateError: 'update-form-error',
        deleteError: 'delete-form-error',
        created: 'org-created',
        updated: 'org-updated',
        deleted: 'org-deleted'
    };

    var create = function (commandResult) {
        var form = new Form(commandResult.args);
        form.save(function (err, doc) {
            if (err || !doc) {
                commandResult.err = err;
                creationFailure(commandResult);
            } else {
                commandResult.form = doc;
                creationSuccess(commandResult);
            }
        });
    };

    var creationFailure = function (commandResult) {
        commandResult.message = 'Form not created';
        self.emit(eventType.createError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var creationSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Form created';
        self.emit(eventType.created, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var update = function (commandResult) {
        var id = commandResult.args._id || commandResult.args.id;

        var query = {_id: id};
        var docDetails;

        if (typeof commandResult.args.toObject === 'function') {
            docDetails = commandResult.args.toObject();
            delete docDetails._id;
        } else {
            docDetails = commandResult.args;
            if (docDetails.hasOwnProperty('_id')) {
                delete docDetails._id;
            }
        }

        Form.findOne(query, function (err, doc) {
            if (err || !doc) {
                commandResult.err = err;
                updateFailure(commandResult);
            } else {
                for (var prop in docDetails) {
                    doc[prop] = docDetails[prop];
                }
                doc.save(function (err, savedDoc) {
                    if (err || !savedDoc) {
                        commandResult.err = err;
                        updateFailure(commandResult);
                    }
                    commandResult.form = savedDoc;
                    updateSuccess(commandResult);
                })
            }
        });
    };

    var updateFailure = function (commandResult) {
        commandResult.message = 'Form not updated';
        self.emit(eventType.updateError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var updateSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Form updated';
        self.emit(eventType.updated, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };


    var deleteRecord = function (commandResult) {
        var details = commandResult.args;
        var id = details._id || details.id;
        var query;

        if (id) {
            query = {_id: id};
        } else {
            deleteFailure(commandResult);
            return;
        }

        Form.remove(query, function (err, numberRemoved) {
            if (err || (numberRemoved < 1)) {
                commandResult.err = err;
                if (!err && (numberRemoved < 1)) {
                    commandResult.err = new Error('Form to remove not found');
                }
                deleteFailure(commandResult);
            } else {
                deleteSuccess(commandResult);
            }
        });
    };

    var deleteFailure = function (commandResult) {
        commandResult.message = 'Form not deleted';
        self.emit(eventType.deleteError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var deleteSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Form deleted';
        self.emit(eventType.deleted, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    self.on(eventType.createCommand, create);
    self.on(eventType.updateCommand, update);
    self.on(eventType.deleteCommand, deleteRecord);


    self.create = function (args, next) {
        continueWith = next;
        var commandResult = new CommandResult(args);
        self.emit(eventType.createCommand, commandResult);
    };

    self.update = function (args, next) {
        continueWith = next;
        var commandResult = new CommandResult(args);
        self.emit(eventType.updateCommand, commandResult);
    };

    self.deleteRecord = function (args, next) {
        continueWith = next;
        var commandResult = new CommandResult(args);
        self.emit(eventType.deleteCommand, commandResult);
    };

    self.events = eventType;

    return self;
};

util.inherits(FormCommand, Emitter);

module.exports = FormCommand;
