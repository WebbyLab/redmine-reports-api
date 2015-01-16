#!/usr/bin/env node
'use strict';

var config     = require('../etc/config');
var appUrl     = config.appUrl;
var minLogTime = config.minLogTime;

var destinationEmails = config.emailReport.destinationEmails.join(", ");

var docopt = require('docopt').docopt;
var moment = require('moment');
var _      = require('lodash');
var axios  = require('axios');

var nodemailer        = require("nodemailer");
var sendmailTransport = require('nodemailer-sendmail-transport');

var ACTIVITIES = [
    'Development',
    'Other',
    'Design',
    'Fixing',
    'Testing by QA',
    'Unknown'
];

var doc = [
    "",
    "Usage:",
    "mail_send.js --send",
    ""
].join("\n");

var opts = docopt(doc);

function Sender() {
    this.transport = nodemailer.createTransport(sendmailTransport());
}

Sender.prototype = {
    send: function(){
        var self = this;
        self._prepareMail().then(function(mailData){
            var tample = {
                from   : config.mail.from,
                subject: "Redmine report ",
                to     : destinationEmails,
                html   : mailData.table
            };

            self.transport.sendMail(tample, function(error, response){
                if(error){
                    console.log(error);
                    process.exit();
                }else{
                    console.log("Message sent: " + response.message);
                    process.exit();
                }
            });
        }).catch(console.error);
    },

    _prepareMail: function(){
        var self = this;

        return this._getTimeEntries().then(function(data){

            var groupedTimeEntries = {};
            var timeEntries = data.timeEntries;
            var users       = data.users;

            for (var i=0; i < timeEntries.length; i++) {
                var user = timeEntries[i].links.user;

                groupedTimeEntries[user] = {
                    totalHours:      timeEntries[i].totalHours,
                    hoursByActivity: timeEntries[i].hoursByActivity,
                    user:            user
                };

                var timeEntry = groupedTimeEntries[user];

                for ( var k = 0; k < ACTIVITIES.length; k++){
                    if ( !timeEntry.hoursByActivity[ACTIVITIES[k]] ) timeEntry.hoursByActivity[ACTIVITIES[k]] = 0;
                }
            }

            return {
                table: self._prepareTable(groupedTimeEntries, users)
            };
        });
    },

    _prepareTable: function(groupedTimeEntries, users){
        var table = '<table cellpadding="10" border="1" cellspacing="0" style="'
                        +'display:inline-block;'
                        +'color:#3A89A3;'
                        +'font-weight: bold;'
                        +'background:#EEE;">'
                        +'<caption><h2>'
                        +'Report from ' + moment().add(-1, 'week').format('YYYY-MM-DD')
                        +' to ' + moment().add(-1, 'day').format('YYYY-MM-DD')
                        +'</h2></caption>'
                        +'<thead style="font-weight:bold;"><tr>'
                        +'<td align="center">User</td>'
                        +'<td>Total hours</td>'
                        +'<td>Development</td>'
                        +'<td>Other</td>'
                        +'<td>Design</td>'
                        +'<td>Fixing</td>'
                        +'<td>Testing by QA</td>'
                        +'<td>Unknown</td>'
                        +'</tr></thead>'
                        +'<tbody><tr>' ;

        function findById(chr) {
            return chr.id == TimeEntry.user;
        }

        for(var key in groupedTimeEntries){

            var TimeEntry = groupedTimeEntries[key] ;
            var name = _.find(users, findById).name;
            var tr = TimeEntry.totalHours < minLogTime ? '<tr style="background:#f2dede; color:#A94442;">' : '<tr style="background: #dff0d8">';
            table += (tr + '<td align="center">'+ name +"</td>");
            table += '<td align="center">' + TimeEntry.totalHours.toFixed(1) + "</td>";

            for ( var j = 0; j < ACTIVITIES.length; j++){
                table += '<td align="center">' + TimeEntry.hoursByActivity[ACTIVITIES[j]].toFixed(1) + "</td>";
            }

            table +="</tr>" ;
        }

        return table + "</tr></tbody></table>" ;
    },

    _getTimeEntries: function(){
        return axios.get(appUrl + "/time_entries",{
            params: {
                startDate: moment().add(-1, 'week').format('YYYY-MM-DD'),
                endDate:   moment().add(-1, 'day').format('YYYY-MM-DD'),
                include:   "user"
            }
        }).then(function(res){
            return {
                users:       res.data.linked.users,
                timeEntries: res.data.timeEntries
            };
        }).catch(console.error);
    }
};

function main() {

    var sender = new Sender();

    if (opts["--send"]){
        sender.send();
    }
}

main();


