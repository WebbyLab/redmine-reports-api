'use strict';

var renderPromise = require('../render');
var services      = require('../services');
var Validator     = require('../services/Validator');

function Projects() {
}

Projects.prototype.list = function(req, res) {
    var promise   = new services.Projects.List({
        validator: new Validator()
    }).run(req.query);

    renderPromise(req, res, promise);
};

module.exports = Projects;

