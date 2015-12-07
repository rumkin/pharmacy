;(function () {
    'use strict';

    var Pharmacy;
    if (typeof module === 'object' && 'exports' in module) {
        module.exports = Store;
        Pharmacy = require('./pharmacy.js');
    } else if (typeof window === 'object' && this === window) {
        window.Pharmacy.Store = Store;
        Pharmacy = window.Pharmacy;
    }

    /**
    * Store is a set of rules and recipes which is an equivalent of a validator.
    *
    * @param {StoreOptions} options Store options object.
    */
    function Store(options) {
        options = options || {};
        this._rules = {};
        this._recipes = {};
        this.executeFunctions = options.executeFunctions || true;

        if (typeof options.rules === 'object') {
            let rules = options.rules;
            Object.getOwnPropertyNames(rules).forEach((name) => {
                this.addRule(name, rules[name]);
            });
        }

        if (typeof options.recipes === 'object') {
            let recipes = options.recipes;
            Object.getOwnPropertyNames(recipes).forEach((name) => {
                this.addRecipe(name, recipes[name]);
            });
        }

        if (options.hasOwnProperty('field')) {
            let field = options.field;

            if (typeof field === 'object') {
                // Extend Pharmacy.Field with new methods and properties.
                let Field = function (options) {
                    Pharmacy.Field.call(this, options);
                };

                Object.setPrototypeOf(Field.prototype, Pharmacy.Field.prototype);
                Object.getOwnPropertyNames(field).forEach(name => {
                    Field.prototype[name] = field[name];
                });

                this.Field = Field;
            } else if (typeof field === 'function') {
                this.Field = field;
            }
        } else {
            this.Field = Pharmacy.Field;
        }
    }

    /**
    * Add rule to list of supported rules. Beacuse of stores can has different
    * rules like JsonSchema or mongo query sanitizers they should be filled with
    * rules before use.
    *
    * @param {string} name Rule name.
    * @param {PharmacyRule|object} rule Rule descriptor object or an instance.
    */
    Store.prototype.addRule = function (name, rule) {
        this._rules[name] = Pharmacy.Rule.to(rule);
    };

    /**
    * Get rule by name.
    *
    * @param  {string} name Rule name.
    * @return {Pharmacy.Rule}
    * @throws {Error} Throws an Error if rule not found.
    */
    Store.prototype.getRule = function (name) {
        if (! this.hasRule(name)) {
          throw new Error('Rule "' + name + '" not found');
        }

        return this._rules[name];
    };

    /**
    * Check if rule is exists in a library and returns it.
    *
    * @param  {string} name Rule name.
    * @return {Pharmacy.Rule|undefined}      Rule instance or undefined.
    */
    Store.prototype.findRule = function (name) {
        if (! this.hasRule(name)) {
          return;
        }

        return this._rules[name];
    };

    /**
    * Check if rule is exists in store rules library.
    *
    * @param  {string}  name Rule name.
    * @return {Boolean}
    */
    Store.prototype.hasRule = function (name) {
        return this._rules.hasOwnProperty(name);
    };

    /**
    * Add pharmacy recipe to store.
    *
    * @param {string} name   Recipe name.
    * @param {Pharmacy.Recipe|object} recipe Pharmacy recipe instance or object.
    *                                        If object is passed then it will be
    *                                        converted into recipe.
    */
    Store.prototype.addRecipe = function (name, recipe) {
        this._recipes[name] = Pharmacy.Recipe.to(recipe);
    };

    /**
    * Get recipe from store library.
    *
    * @param  {string} name Recipe name.
    * @return {Pharmacy.Recipe}      Pharmacy recipe.
    * @throws {Error} Throws an error when recipe not found.
    */
    Store.prototype.getRecipe = function (name) {
        if (! this.hasRecipe(name)) {
          throw new Error('Recipe "' + name + '" not found.');
        }

        return this._recipes[name];
    };

    /**
    * Find recipe if it exists.
    *
    * @param  {string} name Recipe name.
    * @return {Pharmacy.Recipe|undefined} Return recipe if it exists and undefined
    *                                     in other cases.
    */
    Store.prototype.findRecipe = function (name) {
        if (! this.hasRecipe(name)) {
            return;
        }

        return this._recipes[name];
    };

    /**
    * Check if recipe is exists in store recipes library.
    *
    * @param  {name}  name Recipe name.
    * @return {Boolean}
    */
    Store.prototype.hasRecipe = function (name) {
        return this._recipes.hasOwnProperty(name);
    };

    /**
    * Validate value with recipe. Result promise retur validation report and fails
    * only if there is some extra error occurs while validation process.
    *
    * @param  {*} value Value data.
    * @param  {Pharmacey.Recipe|string|object} Recipe to validate value.
    * @return {Promise} Return a promise.
    */
    Store.prototype.validate = function (value, recipe) {
        if (typeof recipe === 'object' && recipe !== null) {
            recipe = Pharmacy.Recipe.to(recipe);
        } else if (typeof recipe === 'string') {
            recipe = this.getRecipe(recipe);
        } else {
            throw new Error('Recipe should be an object or a string');
        }

        var field = new this.Field({
            path: null,
            value: value,
            recipe: recipe,
            store: this
        });

        return field.validate();
    };

    /**
    * Sanitizer returns sanitized data and fails if validation failed.
    *
    * @param  {*} value  Value to sanitize.
    * @param  {Pharmacy.Recipe|string|object} recipe Pharmacy recipe, store's
    *                                                recipe name or recipe
    *                                                descriptor.
    * @return {Promise}
    */
    Store.prototype.sanitize = function (value, recipe) {
        return this.validate(value, recipe).then(function (report) {
            if (report.isValid()) {
                return report.value;
            } else {
                throw new Pharmacy.Error('Data validation failed');
            }
        });
    };
})();
