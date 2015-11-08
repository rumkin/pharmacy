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
    this.recipe = options.recipe;

    this.useRecipe(options.recipe);
  }

  Field.prototype.useRecipe = function (recipe) {
    Object.getOwnPropertyNames(recipe.rules).forEach((name) => {
      var rule = this.store.findRule(name);
      if (rule && rule.hasOwnProperty('field')) {
        rule.field(this);
      }
    });
  };

  Field.prototype.child = function (path, value, recipe) {
    recipe = Pharmacy.Recipe.to(recipe);

    var field = new this.constructor({
      path: this.path.concat(path),
      value: value,
      store: this.store,
      recipe: recipe
    });

    return field;
  };

  Field.prototype.validate = function () {
    if (this.report) {
        // TODO What to do with error?
        return Promise.resolve(this.report);
    }

    var report = this.report = new Pharmacy.Report();
    var rules = this.recipe.getRules();
    var value = this.value;
    var check;

    return new Promise((resolve, reject) => {
        var next = () => {
            if (! report.isValid()) {
                resolve(report);
                return;
            }

            while (rules.length) {

                check = rules.shift();
                let rule;

                if (check.accept instanceof Pharmacy.Rule) {
                    rule = check.accept;
                } else {
                    rule = this.store.findRule(check.name);

                    if (! rule) {
                        continue;
                    }
                }

                value = rule.filter(check.accept, value, this);
                report.value = value;

                let result;
                try {
                    result = rule.validate(check.accept, value, this);
                } catch (err) {
                    reject(err);
                    return;
                }

                if (result instanceof Promise === false) {
                    result = Promise.resolve(result);
                }

                result.then(update).then(next).catch(reject);
                return;
            }

            resolve(report);
        };

        var update = (result) => {
            if (result === true) {
                report.checks++;
                return;
            }

            if (result instanceof Pharmacy.Report) {
                report.issues.push.apply(report.issues, result.issues);
                value = report.value = result.value;
                report.checks += result.checks;
            } else if (Array.isArray(result)) {
                result.forEach(update);
            } else if (result && typeof result === 'object') {
                value = result.value;
                report.issues.push({
                    path: this.path.concat(result.path),
                    rule: result.name,
                    value: value
                });
            } else {
                report.issues.push({
                    path: this.path.slice(),
                    rule: check.name,
                    value: value
                });
                report.checks++;
            }
        };

        next();
    });
  };

})();
