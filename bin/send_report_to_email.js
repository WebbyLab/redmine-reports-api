#!/usr/bin/env node
'use strict';

var config = require('../etc/config');
var appUrl = config.appUrl;

var destinationEmails = config.emailReport.destinationEmails.join(", ");
var login    = config.emailReport.login;
var password = config.emailReport.password;

var docopt     = require('docopt').docopt;
var moment     = require('moment');
var _          = require('lodash');
var axios      = require('axios');

var nodemailer        = require("nodemailer");
var sendmailTransport = require('nodemailer-sendmail-transport');

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
                html   : mailData.tables
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
            var activities  = [];

            for (var i=0; i < timeEntries.length; i++) {
                var user = timeEntries[i].links.user;

                groupedTimeEntries[user] = {
                    totalHours:      timeEntries[i].totalHours,
                    hoursByActivity: timeEntries[i].hoursByActivity,
                    user:            user
                };

                var timeEntry = groupedTimeEntries[user];

                for ( var key in timeEntry.hoursByActivity ){
                    if ( !~activities.indexOf(key) ){
                        activities.push(key);
                    }
                }
            }

            return {
                table: self._prepareTable(groupedTimeEntries, users, activities)
            };
        });
    },

    _prepareTable: function(groupedTimeEntries, users, activities){

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
                        +'<td align="center">Total hours</td>';

        activities.forEach(function(activity){
            table += '<td>' + activity + '</td>';
        });

        table += '</tr></thead>'
              +  '<tbody><tr>' ;

        for(var key in groupedTimeEntries){

            var timeEntry = groupedTimeEntries[key] ;

            var name = _.find(users, function (user) {
                return user.id == timeEntry.user;
            }).name;

            var minimalHours = 35;
            var tr = timeEntry.totalHours < minimalHours ? '<tr style="background:#f2dede; color:#A94442;">' : '<tr style="background: #dff0d8">';
            table += (tr + '<td align="center">'+ name +"</td>");
            table += '<td align="center">' + timeEntry.totalHours.toFixed(1) + "</td>";

            activities.forEach(function(activity){
                var hours = timeEntry.hoursByActivity[activity] !== undefined ? timeEntry.hoursByActivity[activity].toFixed(1) : 0 ;
                table += '<td align="center">' + hours + "</td>";
            });


            table +="</tr>" ;
        }

        return table + "</tr></tbody></table>" ;
    },

    _getTimeEntries: function(){
        return axios({
            url: appUrl + "/time_entries",
            params: {
                startDate: moment().add(-1, 'week').format('YYYY-MM-DD'),
                endDate:   moment().add(-1, 'day').format('YYYY-MM-DD'),
                include:   "user"
            },
            headers: {
                Authorization: "Basic " + new Buffer(login+":"+password).toString('base64')
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


