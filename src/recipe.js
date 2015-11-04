;(function () {
  'use strict';

  var Pharmacy;
  if (typeof module === 'object' && 'exports' in module) {
    module.exports = Recipe;
    Pharmacy = require('./pharmacy.js');
  } else if (typeof window === 'object' && this === window) {
    window.Pharmacy.Recipe = Recipe;
    Pharmacy = window.Pharmacy;
  }

  /**
   * Recipe is a set of rules. In other words is a complete schema for a given
   * data type.
   *
   * @param {Object} options Recipe rules set.
   * @constructor
   * @throws Throws when rule options is not an object.
   */
  function Recipe(rules) {
    if (typeof rules !== 'object') {
      throw new Error('Recipe rules should be an object');
    }

    this.rules = rules;
  }

  Recipe.prototype.getRules = function () {
    return Object.getOwnPropertyNames(this.rules).map((name) => {
      return {
        name: name,
        accept: this.rules[name]
      };
    });
  };

  Recipe.to = function (recipe) {
    if (recipe instanceof this) {
      return recipe;
    } else {
      return new this(recipe);
    }
  };

})();
