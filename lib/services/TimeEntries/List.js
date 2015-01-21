'use strict';

var mongoose  = require('../../mongoose');
var Base      = require('../Base');
var util      = require('util');
var _         = require('lodash');
var Exception = require('../../Exception');
var Q         = require('q');
var moment    = require('moment');

var TimeEntry = mongoose.model('TimeEntry');

function List(args) {
    List.super_.call(this, args);
}

util.inherits(List, Base);

List.prototype.validate = function(data) {
    var rules = {
        users     : { 'list_of': [[{max_length: 10}]] },
        projects  : { 'list_of': [[{max_length: 10}]] },
        startDate : [ 'required','iso_date' ],
        endDate   : [ 'required','iso_date' ]
    };
    return this.validator.validate(data, rules);
};

List.prototype.execute = function(data) {
    var self = this;

    var endDate   = data.endDate;
    var startDate = data.startDate;

    if (endDate < startDate){
        return Q.reject(new Exception({
            code:   "FORMAT_ERROR",
            fields: {
                startDate: "WRONG_DATE_RANGE",
                endDate  : "WRONG_DATE_RANGE"
            }
        }));
    }

    var query = {
        "spentOn": { "$gte":startDate, "$lte":endDate }
    };

    if (data.users)    query.user    = { $in: data.users} ;
    if (data.projects) query.project = { $in: data.projects} ;

    return TimeEntry.findQ(query).then(function(timeEntries){
        return self._groupTimeEntries(timeEntries);
    });
};

List.prototype._groupTimeEntries = function(timeEntries) {

    var groupedTimeEntries = {};

    for (var i=0; i < timeEntries.length; i++) {
        var timeEntry = timeEntries[i];
        var userTimeEntries = groupedTimeEntries[timeEntry.user];

        if (!userTimeEntries) {
            userTimeEntries = {
                totalHours  :    timeEntry.hours,
                hoursByIssue:    {},
                hoursByActivity: {},
                hoursByProject:  {},
                links       : {
                     user  : timeEntry.user,
                     issues: [],
                     projects: []
                }
            };
        } else {
            userTimeEntries.totalHours += timeEntry.hours;
        }

        if (!userTimeEntries.hoursByIssue[timeEntry.issue]){
           userTimeEntries.hoursByIssue[timeEntry.issue] = timeEntry.hours;
        } else {
            userTimeEntries.hoursByIssue[timeEntry.issue] += timeEntry.hours;
        }

        if (!userTimeEntries.hoursByProject[timeEntry.project]){
           userTimeEntries.hoursByProject[timeEntry.project] = timeEntry.hours;
        } else {
            userTimeEntries.hoursByProject[timeEntry.project] += timeEntry.hours;
        }

        if (!userTimeEntries.hoursByActivity[timeEntry.activity]){
           userTimeEntries.hoursByActivity[timeEntry.activity] = timeEntry.hours;
        } else {
            userTimeEntries.hoursByActivity[timeEntry.activity] += timeEntry.hours;
        }

        if (!_.contains(userTimeEntries.links.issues, timeEntry.issue)){
            userTimeEntries.links.issues.push(timeEntry.issue);
        }

        if (!_.contains(userTimeEntries.links.projects, timeEntry.project)){
            userTimeEntries.links.projects.push(timeEntry.project);
        }

        groupedTimeEntries[timeEntry.user] = userTimeEntries;
    }

    var result = _.values(groupedTimeEntries);
    result.forEach(function(timeEntry){
        timeEntry.links.issues.sort();
        timeEntry.links.projects.sort();
        return timeEntry;
    });

    return result;
};

module.exports = List;