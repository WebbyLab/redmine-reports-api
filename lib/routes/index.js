'use strict';

var TimeEntries = require('./TimeEntries');
var Users       = require('./Users');
var Projects    = require('./Projects');

module.exports = {
    TimeEntries: new TimeEntries(),
    Users      : new Users(),
    Projects   : new Projects()
};
