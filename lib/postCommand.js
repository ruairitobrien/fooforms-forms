"use strict";
var Emitter = require('events').EventEmitter;
var util = require('util');

var CommandResult = function (args) {
    return {
        args: args,
        success: false,
        message: 'Invalid arguments',
        err: null,
        post: null
    };
};

var PostCommand = function (Post, CommentStream, PostStream, Comment) {
    Emitter.call(this);
    var self = this;
    var continueWith = null;

    var eventType = {
        createCommand: 'create-post-command',
        updateCommand: 'update-post-command',
        deleteCommand: 'delete-post-command',
        createError: 'create-post-error',
        updateError: 'update-post-error',
        deleteError: 'delete-post-error',
        created: 'org-created',
        updated: 'org-updated',
        deleted: 'org-deleted'
    };

    var create = function (commandResult) {
        var post = new Post(commandResult.args);
        var commentStreamModel = new CommentStream();
        commentStreamModel.save(function (err, commentStream) {
            if (err || !commentStream) {
                commandResult.err = err;
                return creationFailure(commandResult);
            }
            post.commentStreams = [];
            post.commentStreams.push(commentStream._id);
            PostStream.findById(post.postStream, function (err, postStream) {
                if (err || !postStream) {
                    commandResult.err = err;
                    return creationFailure(commandResult);
                }
                post.save(function (err, doc) {
                    if (err || !doc) {
                        commandResult.err = err;
                        return creationFailure(commandResult);
                    }
                    if(!postStream.posts) postStream.posts = [];
                    postStream.posts.push(doc._id);
                    postStream.save(function (err, savedPostStream) {
                        if (err || !savedPostStream) {
                            commandResult.err = err;
                            return creationFailure(commandResult);
                        }
                        commandResult.post = doc;
                        return creationSuccess(commandResult);
                    });
                });
            });
        });
    };

    var creationFailure = function (commandResult) {
        commandResult.message = 'Post not created';
        self.emit(eventType.createError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var creationSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Post created';
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

        Post.findOne(query, function (err, doc) {
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
                    commandResult.post = savedDoc;
                    updateSuccess(commandResult);
                })
            }
        });
    };

    var updateFailure = function (commandResult) {
        commandResult.message = 'Post not updated';
        self.emit(eventType.updateError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var updateSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Post updated';
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

        Post.findById(id, function (err, doc) {
            if (err || !doc) {
                commandResult.err = new Error('Post to remove not found');
                return deleteFailure(commandResult);
            }
            PostStream.findById(doc.postStream, function (err, stream) {
                if (err || !stream) {
                    commandResult.err = err || new Error('Could not find post stream');
                    return deleteFailure(commandResult);
                }
                var index = stream.posts.indexOf(doc._id);
                if (index > -1) {
                    stream.posts.splice(index, 1);
                } else {
                    commandResult.err = new Error('Could not remove from post stream');
                    return deleteFailure(commandResult);
                }
                stream.save(function (err, savedStream) {
                    if (err || !savedStream) {
                        commandResult.err = err || new Error('Could not update post stream to remove post');
                        return deleteFailure(commandResult);
                    } else {
                        Comment.find({commentStream: doc.commentStreams[0]}).remove(function (err) {
                            if (err) {
                                commandResult.err = err;
                                return deleteFailure(commandResult);
                            }
                            doc.remove(function (err, numberRemoved) {
                                if (err || (numberRemoved < 1)) {
                                    commandResult.err = err;
                                    if (!err && (numberRemoved < 1)) {
                                        commandResult.err = new Error('Post to remove not found');
                                    }
                                    return deleteFailure(commandResult);
                                }
                                deleteSuccess(commandResult);
                            });
                        });
                    }
                });
            });
        });
    };

    var deleteFailure = function (commandResult) {
        commandResult.message = 'Post not deleted';
        self.emit(eventType.deleteError, commandResult);
        if (continueWith) {
            continueWith(null, commandResult);
        }
    };

    var deleteSuccess = function (commandResult) {
        commandResult.success = true;
        commandResult.message = 'Post deleted';
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

util.inherits(PostCommand, Emitter);

module.exports = PostCommand;
