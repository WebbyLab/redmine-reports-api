"use strict";
var Q           = require("q");
var assert      = require('chai').assert;
var supertest   = require('supertest');
var app         = require('../app');
var TestFactory = require('./factory/TestFactory');
var factory     = new TestFactory();

var request = supertest.agent(app);

suite('Project list');

before(function(done){
    var projects = [{
        id : 11,
        name: "Project1"
    },
    {
        id : 22,
        name: "Project2"
    },
    {
        id : 33,
        name: "Project3"
    }];

    factory.cleanup().then(function(){
        Q(projects.map(factory.createProject)).all().then(function(){
            done();
        });
    }).catch(console.error);
});

test('Positive: Get project list', function(done) {
    this.timeout(10000);
    request
        .get('/api/v1/projects')
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.ok(res.body.projects);
            assert.equal(res.body.projects.length, 3);
            assert.deepPropertyVal( res.body, 'status', 1);
        }).end(done);
});

