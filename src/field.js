
'use strict';

var Pharmacy = require('./pharmacy.js');

module.exports = Field;


/**
* @typedef {object} FieldOptions
* @property {string[]} path Field path value.
* @property {*} value Value to validate.
* @property {Store} store Pharmacy store object.
* @property {Recipe} recipe Pharmacy recipe instance.
*/

/**
* Field is an object which validate value with recipes from store.
*
* @param {FieldOptions} options Field options object.
* @constructor
*/
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

/**
* Apply recipe to field object.
*
* @param  {Recipe} recipe Recipe object with validation rules set.
*/
Field.prototype.useRecipe = function (recipe) {
Object.getOwnPropertyNames(recipe.rules).forEach((name) => {
  var rule = this.store.findRule(name);
  if (rule && rule.hasOwnProperty('field')) {
    rule.field(this);
  }
});
};

/**
* Create child field if current value is complex.
*
* @param  {string|string[]} path   Child field path.
* @param  {*} value  Child field value.
* @param  {string|Recipe} recipe Child field recipe.
* @return {Field}        New field instance.
*/
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

/**
* Validate field value.
*
* @return {Promise} Promise with report as result.
*/
Field.prototype.validate = function () {
if (this.report) {
    return Promise.resolve(this.report);
}

var report = this.report = new Pharmacy.Report();
var rules = this.recipe.getRules();
var value = this.value;
var accept;
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

            accept = check.accept;
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
            report.addIssue({
                path: this.path.concat(result.path || []),
                rule: result.rule || check.name,
                value: result.value,
                accept: result.accept,
                current: result.current
            });
        } else {
            report.addIssue({
                path: this.path.slice(),
                rule: check.name,
                value: value,
                accept: accept,
                current: false
            });
            report.checks++;
        }
    };

    next();
});
};
