"use strict";
var Emitter = require('events').EventEmitter;
var util = require('util');
var async = require('async');
var PostCommand = require('./postCommand');

var CommandResult = function (args) {
    return {
        args: args,
        success: false,
        message: 'Invalid arguments',
        err: null,
        form: null
    };
};

var FormCommand = function (Form, PostStream, Post, CommentStream, Comment, Folder) {
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
        var postStream = new PostStream();
        postStream.save(function (err, postStream) {
            if (err || !postStream) {
                commandResult.err = err || new Error('PostStream not created');
                return creationFailure(commandResult);
            }
            form.postStreams.push(postStream._id);
            Folder.findById(form.folder, function (err, folder) {
                if (err || !folder) {
                    commandResult.err = err || new Error('Could not find folder');
                    return creationFailure(commandResult);
                }
                form.save(function (err, doc) {
                    if (err || !doc) {
                        commandResult.err = err || new Error('Form not saved');
                        return creationFailure(commandResult);
                    }
                    if (!folder.forms) folder.forms = [];
                    folder.forms.push(doc._id);
                    folder.save(function (err, savedFolder) {
                        if (err || !savedFolder) {
                            commandResult.err = err || new Error('Folder not saved');
                            return creationFailure(commandResult);
                        }
                        commandResult.form = doc;
                        return creationSuccess(commandResult);
                    });
                });
            });
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
        if (!id) {
            deleteFailure(commandResult);
            return;
        }
        Form.findById(id).populate('postStreams').exec(function (err, form) {
            if (err || !form) {
                commandResult.err = err || new Error('Could not delete form');
                return deleteFailure(commandResult);
            }
            Folder.findById(form.folder, function (err, folder) {
                if (err || !folder) {
                    commandResult.err = err;
                    return deleteFailure(commandResult);
                }
                var index = folder.forms.indexOf(form._id);
                if (index > -1) {
                    folder.forms.splice(index, 1);
                } else {
                    commandResult.err = new Error('Could not remove from folder');
                    return deleteFailure(commandResult);
                }
                folder.save(function (err, savedFolder) {
                    if (err || !savedFolder) {
                        commandResult.err = new Error('Could not remove from folder');
                        return deleteFailure(commandResult);
                    } else {
                        var postCommand = new PostCommand(Post, CommentStream, PostStream, Comment);
                        var queries = [];
                        for (var i = 0; i < form.postStreams[0].posts.length; i++) {
                            queries.push({_id: form.postStreams[0].posts[i]});
                        }
                        // Remove all posts first
                        async.map(queries, postCommand.deleteRecord.bind(postCommand), function (err, result) {
                            // Remove the form once done
                            form.remove(function (err) {
                                if (err) {
                                    commandResult.err = err;
                                    deleteFailure(commandResult);
                                } else {
                                    deleteSuccess(commandResult);
                                }
                            });
                        });
                    }
                });
            });
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
