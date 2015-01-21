'use strict';

var Q         = require('q');
var Exception = require('../Exception');
var LIVR      = require('livr');

function Validator() {
    var defaultRules = {

        iso_date: function() {
            return function(value) {
                if(value === undefined || value === null || value === '' ) return;
                var re = /^(\d{4})-(\d{2})-(\d{2})$/ ;
                if ( re.test(value) )  return ;
                return "WRONG_DATE";
            };
        }
    };

    LIVR.Validator.registerDefaultRules(defaultRules);
}

Validator.prototype.validate = function(data, rules) {
    var validator = new LIVR.Validator(rules).prepare();

    var result = validator.validate(data);

    if (!result) {
        var exception = new Exception({
            code:   "FORMAT_ERROR",
            fields: validator.getErrors()
        });
        return Q.reject(exception);
    }

    return Q(result);
};

module.exports = Validator;