#!/usr/bin/env node
'use strict';

var Redmine  = require('promised-redmine');
var docopt   = require('docopt').docopt;
var mongoose = require('.././lib/mongoose');
var Q        = require('q');
var db       = require("../lib/db");
var config   = require('../etc/config');

var TimeEntry = mongoose.model('TimeEntry');
var User      = mongoose.model('User');
var Project   = mongoose.model('Project');

var doc = [
    "",
    "Usage:",
    "sync_time_entries.js --fullsync",
    "sync_time_entries.js --sync",
    ""
].join("\n");

var opts = docopt(doc);

function Syncer(args) {
    if (!args.host) throw "host required";
    if (!args.apiKey) throw "apiKey required";

    this.redmine = new Redmine({
        host:   args.host,
        apiKey: args.apiKey,
        maxTryCount: 5
    });
}

Syncer.prototype = {

    newSync: function(){
        var self = this;
        console.log("Check new timeEntries")
        this.redmine.getTimeEntries({limit:1}).then(function(data) {
            TimeEntry.countQ().then(function(dbCount){
                var totalCount         = data.total_count;
                var lackingTimeEntries = totalCount - dbCount;
                var limit              = 100;
                var requestCount       = Math.floor(lackingTimeEntries/limit);
                var offset             = (requestCount-1)*limit;
                var sentRequests       = 0;
                var residue            = lackingTimeEntries % limit !== 0 ? lackingTimeEntries % limit : limit;
                if (dbCount === totalCount){
                    console.log("Nope new timeEntries.");
                    process.exit();
                }

                console.log(totalCount - dbCount, "New timeEntries");

                function iterateRequest(){
                    console.log('Send %s request', (sentRequests+1) + "th");
                    if (sentRequests == requestCount){
                        self._getTimeEntries(residue, offset).then(function(){
                            console.log('Done');
                            process.exit();
                        },function(e){
                            console.log(e);
                            process.exit();
                        });
                    } else {
                        sentRequests++;
                        self._getTimeEntries(limit, offset).then(function(){
                            offset -= limit;
                            iterateRequest();
                        },function(e){
            console.log(e);
            process.exit();
        });
                    }
                }
                iterateRequest();
            });
        },function(e){
            console.log(e);
            process.exit();
        });
    },

    _getTimeEntries: function(limit, offset){
        var self = this;
        return self.redmine.getTimeEntries({ limit: limit, offset: offset }).then(function(response) {
            return response.time_entries.forEach(self._saveTimeEntries);
        });
    },

    _saveTimeEntries: function(timeEntryData) {
            console.log('SYNC %s', timeEntryData.id);
            // Save time entry
            if (!timeEntryData.activity) timeEntryData.activity = {name : "Unknown"};
            if (!timeEntryData.issue)    timeEntryData.issue    = {id   : '0000'};
            var promises = [];
            promises[0] = new TimeEntry({
                _id     : timeEntryData.id,
                user    : timeEntryData.user.id,
                project : timeEntryData.project.id,
                issue   : timeEntryData.issue.id,
                hours   : timeEntryData.hours,
                activity: timeEntryData.activity.name,
                spentOn : timeEntryData.spent_on
            }).saveQ().catch(console.error);

            // Save user
            promises[1] = User.updateQ({_id: timeEntryData.user.id}, {
               name:  timeEntryData.user.name
            }, {upsert: true}).catch(console.error);

            // Save project
            promises[2] = Project.updateQ({_id: timeEntryData.project.id}, {
               name:  timeEntryData.project.name
            }, {upsert: true}).catch(console.error);

            return Q(promises).all();
        }
};

function main() {

    var syncer = new Syncer({
        host:   config.redmine.host,
        apiKey: config.redmine.apiKey
    });

    if (opts["--sync"]){
        syncer.newSync();
    }

    if (opts["--fullsync"]){
        console.log("Cleanup database...");
        Q(db.dropDatabase()).then(function(){
            console.log("Database clean");
            syncer.newSync();
        });
    }
}

main();


