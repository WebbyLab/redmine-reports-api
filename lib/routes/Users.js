'use strict';

var renderPromise = require('../render');
var services      = require('../services');
var Validator     = require('../services/Validator');

function Users() {
}

Users.prototype.list = function(req, res) {
    req.query.users ? req.query.users = req.query.users.split(',') : false;
    var promise   = new services.Users.List({
        validator: new Validator()
    }).run(req.query);

    renderPromise(req, res, promise);
};

module.exports = Users;

