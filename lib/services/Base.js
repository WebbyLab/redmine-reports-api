'use strict';

function Base(args) {
    if (!args.validator) throw "validator required";

    this.validator  = args.validator;
}

Base.prototype = {
    run: function(params) {
        return this.validate(params).then(this.execute.bind(this));
    }
};

module.exports = Base;