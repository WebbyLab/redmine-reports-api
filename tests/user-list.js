"use strict";

var assert      = require('chai').assert;
var supertest   = require('supertest');
var app         = require('../app');
var TestFactory = require('./factory/TestFactory');
var factory     = new TestFactory();
var Q           = require('q');

var request = supertest.agent(app);

suite('User list');

before(function(done){
    var users = [{
        id  : 102,
        name: "user1"
    },
    {
        id  : 122,
        name: "user2"
    }];

    factory.cleanup().then(function(){
        Q(users.map(factory.createUser)).all().then(function(){
            done();
        });
    }).catch(console.error);
});



test('Positive: Get user list', function(done) {

    this.timeout(10000);
    request
        .get('/api/v1/users')
        .send()
        .expect(200)
        .expect('Content-Type', /json/)
        .expect( function(res) {
            assert.ok(res.body.users);
            assert.equal(res.body.users.length, 2);
            assert.deepPropertyVal( res.body, 'status', 1);
        }).end(done);
});

