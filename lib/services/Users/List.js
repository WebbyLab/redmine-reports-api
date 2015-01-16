'use strict';

var mongoose      = require('../../mongoose');
var Base          = require('../Base');
var util          = require('util');
var servicesUtils = require('../utils.js');

var User = mongoose.model('User');

function List(args) {
    List.super_.call(this, args);
}

util.inherits(List, Base);

List.prototype.validate = function(data) {
    var rules = {
        users: { list_of: [[{max_length: 10}]] }
    };

    return this.validator.validate(data, rules);
};

List.prototype.execute = function(data) {
    var query = data.users ? { _id: { $in: data.users} } : {} ;

    return User.findQ(query).then(function(users){
        var usersList = users.map(function(user){
            return servicesUtils.dumpUser(user);
        });

        return { users: usersList };
    });
};

module.exports = List;