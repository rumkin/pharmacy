;(function () {
  'use strict';

  var Pharmacy;
  if (typeof module === 'object' && 'exports' in module) {
    module.exports = Rule;
    Pharmacy = require('./pharmacy.js');
  } else if (typeof window === 'object' && this === window) {
    window.Pharmacy.Rule = Rule;
    Pharmacy = window.Pharmacy;
  }

  /**
   * Rule is a minimal validation or sanitizer element which produce filtering
   * or validation operation over passed value.
   *
   * @param {RuleOptions} options Rule options object
   * @constructor
   * @throws Throws when rule options contain properties which should be
   * a function but has a different type.
   */
  function Rule(options) {
    options = options || {};
    ['field', 'filter', 'validate'].forEach((name) => {
      var isFunction
         = options.hasOwnProperty(name)
        && typeof options[name] === 'function';

      if (! isFunction) {
        throw new Error('Rule option ' + name + 'should be a function or null');
      } else {
        this[name] = options[name];
      }
    });
  }

  /**
   * Field extender. This method get field as argument and add custom methods
   * to it. It could be isObject method or isEmpty.
   * @param {Pharmacy.Field} Field instance.
   * @example
   *
   * rule.field = function(field) {
   * 	field.isObject = function() {
   * 		return this.value && typeof this.value === 'object';
   * 	};
   * };
   */
  Rule.prototype.field = function (field) {};

  /**
   * Rule filter should sanitize value and return a proper result.
   *
   * @param  {*} accept Acceptable value.
   * @param  {*} value  Value to filter.
   * @return {*}        Filtered value.
   */
  Rule.prototype.filter = function (accept, value) {
    return value;
  };

  /**
   * Validate value and match it with acceptable value. Rule validator should
   * return true if everything is ok. In other ways result will be treated as
   * a failed validation.
   *
   * @return {Boolean|Pharmacy.Issue[]|Pharmacy.Report}
   */
  Rule.prototype.validate = function () {
    return true;
  };
})();
