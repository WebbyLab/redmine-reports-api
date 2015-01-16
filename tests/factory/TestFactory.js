"use strict";

var db        = require('../../lib/db.js');
var Q         = require('q');
var _         = require('lodash');
var mongoose  = require('../../lib/mongoose');
var Project   = mongoose.model('Project');
var User      = mongoose.model('User');
var TimeEntry = mongoose.model('TimeEntry');

function TestFactory() {}

TestFactory.prototype = {
    createProject: function(projectData) {
        var template = {
            _id : projectData.id,
            name: projectData.name
         };
        _.extend( template, projectData );
        var project = new Project( template );
        return project.saveQ();
    },

    createUser: function(userData) {
        var template = {
            _id : userData.id,
            name: userData.name
         };
        _.extend( template, userData );
        var user = new User( template );
        return user.saveQ();
    },

    createTimeEntry: function(timeEntryData) {
        var template = {
            _id    : timeEntryData.id,
            user   : timeEntryData.user,
            project: timeEntryData.project,
            issue  : timeEntryData.issue,
            hours  : timeEntryData.hours,
            spentOn: timeEntryData.spentOn
         };
        _.extend( template, timeEntryData );
        var timeEntry = new TimeEntry( template );
        return timeEntry.saveQ();
    },

    cleanup: function() {
        return Q(db.dropDatabase());
    }
};

module.exports = TestFactory;


