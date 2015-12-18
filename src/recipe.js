'use strict';

module.exports = Recipe;

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
    } else if (Array.isArray(rules)) {
        rules = rules.reduce((rules, rule) => {
            Object.getOwnPropertyNames(rule).forEach((name) => {
                rules[name] = rule[name];
            });
            return rules;
        }, {});
    }

    this.rules = rules;
  }

  /**
   * Get recipe rules.
   * @return {object[]} Return list of rules.
   */
  Recipe.prototype.getRules = function () {
    return Object.getOwnPropertyNames(this.rules).map((name) => {
      return {
        name: name,
        accept: this.rules[name]
      };
    });
  };

  /**
   * Check if recipe has a specified rule.
   *
   * @param  {string}  name Rule name.
   * @return {Boolean}
   */
  Recipe.prototype.hasRule = function (name) {
      return this.rules.hasOwnProperty(name);
  };

  /**
   * Convert object to recipe or do nothing if it is already a Recipe instance.
   * @param  {object|Recipe} recipe Native object or recipe.
   * @return {Recipe}        Return recipe instance.
   */
  Recipe.to = function (recipe) {
    if (recipe instanceof this) {
      return recipe;
    } else {
      return new this(recipe);
    }
  };
