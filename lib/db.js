"use strict";

var mongojs = require("mongojs");
var collections = ['timeEntries','users','projects'];
var db = mongojs( process.env.TEST_MODE ? 'redmineReportsTest' : 'redmineReports', collections);

db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;

