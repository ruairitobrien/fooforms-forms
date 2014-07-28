"use strict";
var Emitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');


var Form = function () {
    Emitter.call(this);
    var self = this;


};

util.inherits(Form, Emitter);

module.exports = Form;