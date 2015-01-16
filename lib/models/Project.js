'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var ProjectSchema = new Schema({
    _id:          { type: Number, required: true },
    name:        { type: String, required: true }
});

mongoose.model('Project', ProjectSchema);

