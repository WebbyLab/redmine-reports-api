'use strict';

var bodyParser = require('body-parser');
var cors       = require('cors');
var auth       = require('http-auth');
var express    = require('express');

var app        = express();
var router     = express.Router();

var config     = require('./etc/config.json');
var staticPath = config.staticPath;


app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json({limit:1024*1024}));
app.use(express.static( __dirname + '/' + staticPath));

// Authentication module.
var basic = auth.basic({
    realm: "RedmineReports Area.",
    file: __dirname + "/etc/users.htpasswd"
});

if ( !process.env["TEST_MODE"] ) app.use(auth.connect(basic));

app.use(router);

var routes = require('./lib/routes');

// request
router.get('/api/v1/time_entries', routes.TimeEntries.list.bind(routes.TimeEntries));
router.get('/api/v1/users',        routes.Users.list.bind(routes.Users));
router.get('/api/v1/projects',     routes.Projects.list.bind(routes.Projects));

app.listen(8080);
module.exports = app;
