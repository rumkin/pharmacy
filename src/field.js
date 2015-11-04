;(function () {
  'use strict';

  var Pharmacy;
  if (typeof module === 'object' && 'exports' in module) {
    module.exports = Field;
    Pharmacy = require('./pharmacy.js');
  } else if (typeof window === 'object' && this === window) {
    window.Pharmacy.Field = Field;
    Pharmacy = window.Pharmacy;
  }

  function Field(options) {
    if (typeof options !== 'object') {
      throw new Error('Options should be an object');
    }

    this.path = options.path || [];
    this.value = options.value;
    this.store = options.store;

    this.useRecipe(options.recipe);
  }

  Field.prototype.useRecipe = function (recipe) {
    Object.getOwnPropertyNames(recipe.rules).forEach((name) => {
      var rule = this.store.getRule(name);
      if (rule.hasOwnProperty('field')) {
        rule.field(this);
      }
    });
  };

  Field.prototype.child = function (path, value, recipe) {
    recipe = Recipe.getRecipe(recipe);

    var field = new Field({
      path: this.path.concat(path),
      value: value,
      store: this.store,
      recipe: recipe
    });

    return field;
  };

  Field.prototype.validate = function () {
    if (this.report) {
      return;
    }

    var report = new Pharmacy.Report();


  };

})();
