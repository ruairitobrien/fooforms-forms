/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var should = require('should');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId();

var mockgoose = require('mockgoose');
mockgoose(mongoose);
var db = mongoose.connection;

var FooForm = require('../index');

describe('FooForm', function () {
   var fooForm = new FooForm(db);

    describe('Form Commands', function () {

    });

    describe('Form Queries', function () {

    });

    describe('Post Commands', function () {

    });

    describe('Post Queries', function () {

    });

    describe('Comment Commands', function () {

    });

    describe('Comment Queries', function () {

    });
});
