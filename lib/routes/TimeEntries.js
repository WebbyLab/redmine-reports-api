'use strict';

var renderPromise = require('../render');
var services      = require('../services');
var Validator     = require('../services/Validator');

function TimeEntries() {
}

TimeEntries.prototype.list = function(req, res) {
    req.query.users    ? req.query.users    = req.query.users.split(',')    : false;
    req.query.projects ? req.query.projects = req.query.projects.split(',') : false;

    var promise   = new services.TimeEntries.List({
        validator: new Validator()
    }).run(req.query).then(function(timeEntries){
        if (req.query.include == "user"){

            var users = timeEntries.map(function(timeEntry){
                return timeEntry.links.user;
            });

            return new services.Users.List({
                validator: new Validator()
            }).run({ users: users }).then(function(linked){
                return {
                    timeEntries: timeEntries,
                    linked: linked
                };
            });
        }
        return { timeEntries:timeEntries };
    });

    renderPromise(req, res, promise);
};

module.exports = TimeEntries;

