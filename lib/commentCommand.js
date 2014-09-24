"use strict";
var Emitter = require('events').EventEmitter;
var util = require('util');

var CommandResult = function (args) {
    return {
        args: args,
        success: false,
        message: 'Invalid arguments',
        err: null,
        comment: null
    };
};

var CommentCommand = function (Comment, CommentStream) {
    Emitter.call(this);
    var self = this;
    var continueWith = null;

    var eventType = {
        createCommand: 'create-comment-command',
        updateCommand: 'update-comment-command',
        deleteCommand: 'delete-comment-command',
        createError: 'create-comment-error',
        updateError: 'update-comment-error',
        deleteError: 'delete-comment-error',
        created: 'org-created',
        updated: 'org-updated',
        deleted: 'org-deleted'
    };

    var create = function (commandResult) {
        var comment = new Comment(commandResult.args);
        CommentStream.findById(comment.commentStream, function (err, commentStream) {
            if (err || !commentStream) {
                commandResult.err = err;
                return creationFailure(commandResult);
            }
            comment.save(function (err, doc) {
                if (err || !doc) {
                    commandResult.err = err;
                    return creationFailure(commandResult);
                }
                if(!commentStream.comments) commentStream.comments = [];
                commentStream.comments.push(doc._id);
                commentStream.save(function (err, savedStream) {
                    if (err || !savedStream) {
                        commandResult.err = err;
                        return creationFailure(commandResult);
                    }
                    commandResult.comment = doc;
                    return creationSuccess(commandResult);
                });
            });
        });

    };

    var creationFailure = function (commandResult) {
        commandResult.message = 'Comment not created';
        self.emit(eventType.createError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var creationSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Comment created';
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

        Comment.findOne(query, function (err, doc) {
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
                    commandResult.comment = savedDoc;
                    updateSuccess(commandResult);
                })
            }
        });
    };

    var updateFailure = function (commandResult) {
        commandResult.message = 'Comment not updated';
        self.emit(eventType.updateError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var updateSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Comment updated';
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

        Comment.findById(id, function (err, doc) {
            if (err || !doc) {
                commandResult.err = new Error('Comment to remove not found');
                return deleteFailure(commandResult);
            }
            CommentStream.findById(doc.commentStream, function (err, stream) {
                if (err || !stream) {
                    commandResult.err = err || new Error('Could not remove from comment stream');
                    return deleteFailure(commandResult);
                }
                var index = stream.comments.indexOf(doc._id);
                if (index > -1) {
                    stream.comments.splice(index, 1);
                } else {
                    commandResult.err = new Error('Could not remove from comment stream');
                    return deleteFailure(commandResult);
                }
                stream.save(function (err, savedStream) {
                    if (err || !savedStream) {
                        commandResult.err = new Error('Could not remove from comment stream');
                        return deleteFailure(commandResult);
                    } else {
                        doc.remove(function (err, numberRemoved) {
                            if (err || (numberRemoved < 1)) {
                                commandResult.err = err;
                                if (!err && (numberRemoved < 1)) {
                                    commandResult.err = new Error('Comment to remove not found');
                                }
                                return deleteFailure(commandResult);
                            } else {
                                deleteSuccess(commandResult);
                            }
                        });
                    }
                });
            });
        });
    };

    var deleteFailure = function (commandResult) {
        commandResult.message = 'Comment not deleted';
        self.emit(eventType.deleteError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var deleteSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Comment deleted';
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

util.inherits(CommentCommand, Emitter);

module.exports = CommentCommand;
