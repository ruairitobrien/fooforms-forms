"use strict";
var Emitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');


var FooForm = function () {
    Emitter.call(this);
    var self = this;


};

util.inherits(FooForm, Emitter);

module.exports = FooForm;