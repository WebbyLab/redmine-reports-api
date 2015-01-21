'use strict';
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var TimeEntrySchema = new Schema({
    _id:        { type: Number, required: true },
    user:       { type: Number, required: true, ref: 'User' },
    project:    { type: Number, required: true, ref: 'Projects' },
    issue:      { type: Number, required: true},
    hours:      { type: Number, required: true },
    activity:   { type: String, required: true },
    spentOn:    { type: Date,   required: true },
});
mongoose.model('TimeEntry', TimeEntrySchema);
