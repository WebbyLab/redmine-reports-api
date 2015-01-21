'use strict';

var mongoose = require('mongoose-q')(require('mongoose'));

mongoose.connect('mongodb://localhost:27017/' + ( process.env.TEST_MODE ? 'redmineReportsTest' : 'redmineReports' ));

require('./models/User.js');
require('./models/Project.js');
require('./models/TimeEntry.js');

module.exports = mongoose;
