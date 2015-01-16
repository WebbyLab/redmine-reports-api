"use strict";

var assert      = require('chai').assert;
var supertest   = require('supertest');
var app         = require('../app');
var TestFactory = require('./factory/TestFactory');
var factory     = new TestFactory();
var Q           = require('q');
var moment      = require('moment');
var request = supertest.agent(app);

suite('Time entries List');

before(function(done){
    var projects = [{
        id : 1,
        name: "Project1"
    },
    {
        id : 2,
        name: "Project2"
    }];

    var users = [{
        id: 102,
        name: "User1"
    },
    {
        id: 202,
        name: "User2"
    }];

    var timeEntries = [{
        id      : 11,
        user    : 102,
        project : 1,
        issue   : 1055,
        hours   : 3,
        activity: "Development",
        spentOn : moment().add(-1, "day").format("YYYY-MM-DD")
    },
    {
        id      : 13,
        user    : 102,
        project : 1,
        issue   : 1056,
        hours   : 0.6,
        activity: "Development",
        spentOn : moment().add(-2, "week").format("YYYY-MM-DD")
    },
    {
        id      : 14,
        user    : 202,
        project : 2,
        issue   : 1058,
        hours   : 4,
        activity: "Testing",
        spentOn : moment().add(-1, "day").format("YYYY-MM-DD")
    },
    {
        id      : 15,
        user    : 202,
        project : 1,
        issue   : 1060,
        hours   : 1,
        activity: "Testing",
        spentOn : moment().format("YYYY-MM-DD")
    }];


    factory.cleanup().then(function(){
        var promises = projects.map(factory.createProject);
        promises.push.apply(promises, users.map(factory.createUser));
        promises.push.apply(promises, timeEntries.map(factory.createTimeEntry) );

        return Q(promises).all().then(function(res){
            done();
        });
    }).catch(console.error);
});



test('Positive: Get time entries list', function(done) {
    var startDate  = moment().add(-2, "day").format("YYYY-MM-DD");
    var endDate    = moment().add(2,  "day").format("YYYY-MM-DD");
    this.timeout(10000);
    request
        .get('/api/v1/time_entries?startDate='+startDate+'&endDate='+endDate)
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.deepEqual( res.body, {
                status: 1,
                timeEntries: [{
                    totalHours     : 3,
                    hoursByIssue   : { '1055': 3 },
                    hoursByActivity: { 'Development': 3 },
                    hoursByProject:  { '1': 3},
                    links          : {
                        user  : 102,
                        issues: [1055],
                        projects: [1]
                    }
                },{
                    totalHours     : 5,
                    hoursByIssue   : { '1060': 1, '1058': 4 },
                    hoursByActivity: { 'Testing': 5 },
                    hoursByProject:  { '1': 1, '2':4},
                    links          : {
                        user: 202,
                        issues: [1058, 1060],
                        projects: [1,2]
                    }
                }
                ],
            });
        }).end(done);
});

test('Positive: Get time entries by user', function(done) {
    var startDate  = moment().add(-2, "day").format("YYYY-MM-DD");
    var endDate    = moment().add( 2, "day").format("YYYY-MM-DD");
    this.timeout(10000);
    request
        .get('/api/v1/time_entries?users=102&startDate='+startDate+'&endDate='+endDate)
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.deepEqual( res.body, {
                status: 1,
                timeEntries: [{
                    totalHours     : 3,
                    hoursByIssue   : { '1055': 3 },
                    hoursByProject:  { '1': 3},
                    hoursByActivity: { 'Development': 3 },
                    links          : {
                        user  : 102,
                        issues: [1055],
                        projects: [1]
                    }
                }],
            });
        }).end(done);
});

test('Positive: Get time entries by project', function(done) {
    var startDate  = moment().add(-2, "day").format("YYYY-MM-DD");
    var endDate    = moment().add( 2, "day").format("YYYY-MM-DD");
    this.timeout(10000);
    request
        .get('/api/v1/time_entries?projects=1&startDate='+startDate+'&endDate='+endDate)
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.deepEqual( res.body, {
                status: 1,
                timeEntries: [{
                    totalHours     : 3,
                    hoursByIssue   : { '1055': 3 },
                    hoursByActivity: { 'Development': 3 },
                    hoursByProject:  { '1': 3},

                    links          : {
                        user  : 102,
                        issues: [1055],
                        projects: [1]
                    }
                },
                {
                    totalHours     : 1,
                    hoursByIssue   : {'1060': 1 },
                    hoursByProject:  { '1': 1},
                    hoursByActivity: { 'Testing': 1 },
                    links          : {
                        user: 202,
                        issues: [1060],
                        projects: [1]
                    }
                }
                ],
            });
        }).end(done);
});

test('Positive: Get time entries by date', function(done) {
    var startDate  = moment().add(-3, "week").format("YYYY-MM-DD");
    var endDate    = moment().add(-1, "week").format("YYYY-MM-DD");
    this.timeout(10000);
    request
        .get('/api/v1/time_entries?startDate='+startDate+'&endDate='+endDate)
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.deepEqual( res.body, {
                status: 1,
                timeEntries: [{
                    totalHours      : 0.6,
                    hoursByIssue    : { '1056': 0.6 },
                    hoursByActivity : { 'Development': 0.6 },
                    hoursByProject  : { "1": 0.6},
                    links           : {
                        user  : 102,
                        projects: [1],
                        issues: [1056]
                    }
                }],
            });
        }).end(done);
});

test('Positive: Get time entries list with include', function(done) {
    var startDate  = moment().add(-2,"day").format("YYYY-MM-DD");
    var endDate    = moment().add( 2,"day").format("YYYY-MM-DD");
    this.timeout(10000);
    request
        .get('/api/v1/time_entries?startDate='+startDate+'&endDate='+endDate+'&include=user')
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.deepPropertyVal( res.body, 'status', 1);
            assert.deepEqual( res.body.linked, {
                users: [{
                    id  : "102",
                    name: "User1"
                },
                {
                    id  : "202",
                    name: "User2"
                }]
            });
        }).end(done);
});

test('Negative: Get time entries list with wrong date', function(done) {
    this.timeout(10000);
    request
        .get('/api/v1/time_entries?startDate=2015-01-01&endDate=2014-07-07')
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.deepPropertyVal( res.body, 'status', 0);
            assert.deepEqual( res.body, {
                status: 0,
                error: {
                    code:   "FORMAT_ERROR",
                    fields: {
                        startDate: "WRONG_DATE_RANGE",
                        endDate  : "WRONG_DATE_RANGE"
                    }
                }
            });
        }).end(done);
});

test('Positive: Get time entries by current date', function(done) {
    var startDate  = moment().format("YYYY-MM-DD");
    var endDate    = moment().format("YYYY-MM-DD");
    this.timeout(10000);
    request
        .get('/api/v1/time_entries?startDate='+startDate+'&endDate='+endDate)
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.deepEqual( res.body, {
                status: 1,
                timeEntries: [{
                    totalHours      : 1,
                    hoursByIssue    : { '1060': 1 },
                    hoursByActivity : { 'Testing': 1 },
                    hoursByProject  : { '1': 1 },
                    links           : {
                        user  : 202,
                        issues: [1060],
                        projects: [1]
                    }
                }],
            });
        }).end(done);
});
