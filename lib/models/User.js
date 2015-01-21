'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    _id:  { type: Number, required: true },
    name: { type: String, required: true }
});

mongoose.model('User', UserSchema);