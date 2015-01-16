'use strict';

var mongoose      = require('../../mongoose');
var Base          = require('../Base');
var util          = require('util');
var servicesUtils = require('../utils.js');

var Project = mongoose.model('Project');

function List(args) {
    List.super_.call(this, args);
}

util.inherits(List, Base);

List.prototype.validate = function(data) {
    return this.validator.validate(data, {});
};

List.prototype.execute = function() {
    return Project.findQ().then(function(projects){
        var projectsList = projects.map(function(project){
            return servicesUtils.dumpProject(project);
        });

        return { projects: projectsList };
    });
};

module.exports = List;