var test = require('unit.js');
var pharmacy = require(
  process.env.COVER
    ? '../lib-cov/pharmacy.js'
    : '..'
);

describe('pharmacy store object', function () {
    it('Should add rules on creation', function () {
        var store = new pharmacy.Store({
            rules: {
                isTrue: function (accept, value) {
                    return (value === true) === accept;
                }
            }
        });

        test.bool(store.hasRule('isTrue')).isTrue();
    });

    it('Should throw on getting unexcistent rule', function () {
        var store = new pharmacy.Store();

        test.function(function () {
            store.getRule('isTrue');
        }).throws(Error);
    });

    it('Should add new rule', function () {
        var store = new pharmacy.Store();

        store.addRule('equal', function (accept, value) {
            return accept === value;
        });

        test.bool(store.hasRule('equal')).isTrue();
    });

    it('Should not throw on finding unexcistent rule', function () {
        var store = new pharmacy.Store();

        var result = store.findRule('someRule');
        test.value(result).is(undefined);
    });

    it('Should convert objects to pharmacy.Rule', function () {
        var store = new pharmacy.Store({
            rules: {
                type(accept, value) {
                    return typeof value === accept;
                }
            }
        });

        test.object(store.getRule('type')).isInstanceOf(pharmacy.Rule);
    });

    it('Should add recipe on creation', function () {
        var store = new pharmacy.Store({
            rule: {
                type: function (accept, value) {
                    return typeof value === accept;
                }
            },
            rule: {
                string: {
                    type: 'string'
                },
                number: {
                    type: 'number'
                }
            }
        });

        test.bool(store.hasRecipe('string'));
        test.bool(store.hasRecipe('number'));
    });


    it('Should add recipe with addRecipe method', function () {
        var store = new pharmacy.Store({
            rule: {
                type: function (accept, value) {
                    return typeof value === accept;
                }
            }
        });

        store.addRecipe('string', {type: 'string'});
    });

    it('Should get recipe', function () {
        var store = new pharmacy.Store({
            rule: {
                type: function (accept, value) {
                    return typeof value === accept;
                }
            },
            recipes: {
                string: {type: 'string'}
            }
        });

        var recipe = store.getRecipe('string');

        test.object(recipe);
    });

    it('Should throw on getting unexcistent recipe', function () {
        var store = new pharmacy.Store();

        test.function(function () {
            store.getRecipe('notExists');
        }).throws(Error);
    });

    it('Should convert object recipe to pharmacy.Recipe', function () {
        var store = new pharmacy.Store({
            rule: {
                type: function (accept, value) {
                    return typeof value === accept;
                }
            },
            recipes: {
                string: {type: 'string'}
            }
        });

        var recipe = store.getRecipe('string');

        test.object(recipe).isInstanceOf(pharmacy.Recipe);
    });

    it('Should not throw on finding unexcistent recipe', function () {
        var store = new pharmacy.Store();

        var result = store.findRecipe('someRule');
        test.value(result).is(undefined);
    });

    it('Should return promise on validate', function () {
        var store = new pharmacy.Store({
            rule: {
                type(accept, value) {
                    return typeof value === accept;
                }
            }
        });

        test.object(store.validate('hello', {type: 'string'})).isInstanceOf(Promise);
    });

    it('Should validate recipe as object', function () {
        var store = new pharmacy.Store({
            rule: {
                type: function (accept, value) {
                    return typeof value === accept;
                }
            }
        });

        return store.validate('hello', {type: 'string'}).then(function (report) {
            test.object(report).hasProperty('issues');
            test.array(report.issues);
            test.bool(report.isValid()).isTrue();
        });
    });

    it('Should validate recipe by name', function () {
        var store = new pharmacy.Store({
            rules: {
                type: function (accept, value) {
                    return typeof value === accept;
                }
            },
            recipes: {
                string: {type: 'string'}
            }
        });

        return store.validate('hello', 'string').then(function (report) {
            test.object(report).hasProperty('issues');
            test.array(report.issues);
            test.bool(report.isValid()).isTrue();
        });
    });

    it('Should capture validator error and pass to promise', function () {
        var message = 'Test';
        var store = new pharmacy.Store({
            rules: {
                type(accept, value) {
                    throw new Error(message);
                }
            }
        });

        return store.validate(null, {type: true}).catch(function (error) {
            test.object(error).hasProperty('message', message);
        });
    });

    it('Should overwrite path with options.path', function () {
        var message = 'Test';
        var store = new pharmacy.Store({
            rules: {
                type(accept, value) {
                    return false;
                }
            }
        });

        return store.validate(null, {type: true}, {path: ['this']})
        .then(function(report){
            test.bool(report.isValid())
                .isFalse();

            var issues = report.issues;

            test.object(issues[0])
                .hasOwnProperty('path');

            test.object(issues[0].path).is(['this']);
        });
    });

    it('Should find invalid issues with hasIssue() and string path', function () {
        var message = 'Test';
        var store = new pharmacy.Store({
            rules: {
                type(accept, value) {
                    return false;
                }
            }
        });

        return store.validate(null, {type: true}, {path: ['this', 'value']})
        .then(function(report){
            test.bool(report.isValid())
                .isFalse();

            test.bool(report.hasIssue('this.value')).isTrue()
        });
    });

    it('Should find invalid issues with hasIssue() and array path', function () {
        var message = 'Test';
        var store = new pharmacy.Store({
            rules: {
                type(accept, value) {
                    return false;
                }
            }
        });

        return store.validate(null, {type: true}, {path: ['this', 'value']})
        .then(function(report){
            test.bool(report.isValid())
                .isFalse();

            test.bool(report.hasIssue(['this', 'value'])).isTrue()
        });
    });

    it('Sanitize method should return a promise', function () {
        var store = new pharmacy.Store({
            rules: {
                integer: {
                    filter(accept, value) {
                        if (typeof value === 'string') {
                            value = parseInt(value, 10);
                        }

                        return value;
                    },
                    validate (accept, value) {
                        return typeof value === 'number';
                    }
                }
            }
        });

        test.object(store.sanitize('1', {integer: true})).isInstanceOf(Promise);
    });

    it('Should return value on sanitation', function () {
        var store = new pharmacy.Store({
            rules: {
                integer: {
                    filter(accept, value) {
                        if (typeof value === 'string') {
                            value = parseInt(value, 10);
                        }

                        return value;
                    },
                    validate (accept, value) {
                        return typeof value === 'number';
                    }
                }
            }
        });

        return store.sanitize('1', {integer: true}).then(function (value) {
            test.number(value).is(1);
        });
    });

    it('Should throw pharmacy.Error on sanitation if data is invalid', function () {
        var store = new pharmacy.Store({
            rules: {
                integer: {
                    filter(accept, value) {
                        if (typeof value === 'string') {
                            value = parseInt(value, 10);
                        }

                        return value;
                    },
                    validate (accept, value) {
                        return typeof value === 'number';
                    }
                }
            }
        });

        return store.sanitize(false, {integer: true}).catch(function (error) {
            test.object(error).isInstanceOf(pharmacy.Error);
        });
    });

    it('Should add field methods', function(){
        var store = new pharmacy.Store({
            field: {
                isTrue() {
                    return this.value === true;
                }
            },

            rules: {
                isTrue(accept, value, field) {
                    return field.isTrue() === accept;
                }
            }
        });

        return store.validate(true, {isTrue: true});
    });

    it('Should use field as constructor', function(){
        var CustomField = function () {
            pharmacy.Field.apply(this, arguments);
        };

        Object.setPrototypeOf(CustomField.prototype, pharmacy.Field.prototype);

        CustomField.prototype.isTrue = function () {
            return this.value === true;
        };

        var store = new pharmacy.Store({
            field: CustomField,
            rules: {
                isTrue(accept, value, field) {
                    return field.isTrue() === accept;
                }
            }
        });

        return store.validate(true, {isTrue: true});
    });

    it('Should return recipe on findRecipe() method call', function () {
        var store = new pharmacy.Store();
        store.addRecipe('test', {
            rule: true
        });

        var recipe = store.findRecipe('test');
        test.object(recipe).hasProperty('rules');
        test.object(recipe.rules).hasProperty('rule', true);
    });

    it('Should throw on invalid validation recipe', function () {
        test.function(function(){
            var store = new pharmacy.Store();
            store.validate(null);
        }).throws(/Recipe/);
    });

    describe('Field', function () {
        it('Should throws if argument #1 is not an object', function () {
            test.function(function () {
                var field = new pharmacy.Field();
            }).throws(/Options/);
        });
    });

    describe('Rule', function () {
        it('Should throw on invalid constructor arguments', function () {
            test.function(function(){
                new pharmacy.Rule();
            }).throws(/Options/);
        });

        it('Should throw on invalid field value', function () {
            test.function(function(){
                new pharmacy.Rule({field: null});
            }).throws(/field/);
        });

        it('Should throw on invalid filter value', function () {
            test.function(function(){
                new pharmacy.Rule({filter: null});
            }).throws(/filter/);
        });

        it('Should throw on invalid validate value', function () {
            test.function(function(){
                new pharmacy.Rule({validate: null});
            }).throws(/validate/);
        });

        it('Should set default methods on empty options', function () {
            var rule = new pharmacy.Rule({});

            test.function(rule.field).is(pharmacy.Rule.prototype.field);
            test.function(rule.filter).is(pharmacy.Rule.prototype.filter);
            test.function(rule.validate).is(pharmacy.Rule.prototype.validate);
        });
    });

    describe('Recipe', function () {
        it('Should accept rules as object', function () {
            var recipe = new pharmacy.Recipe({rule:true});

            test.bool(recipe.hasRule('rule')).isTrue();
        });

        it('Should accept rules as array', function () {
            var recipe = new pharmacy.Recipe([{
                ruleA:true
            }, {
                ruleB: true
            }]);

            test.bool(recipe.hasRule('ruleA')).isTrue();
            test.bool(recipe.hasRule('ruleB')).isTrue();
        });

        it('Should throw if rules is not an object', function () {
            test.function(function() {
                new pharmacy.Recipe(false);
            }).throws(/Recipe/);
        });

        it('Should not convert Recipe instance', function () {
            var recipe = new pharmacy.Recipe({
                rule: true
            });

            test.object(pharmacy.Recipe.to(recipe))
                .is(recipe);
        });

        it('Should return valid values on hasRule()', function () {
            var recipe = new pharmacy.Recipe({
                ruleA: true,
                ruleB: true
            });

            test.bool(recipe.hasRule('ruleA')).isTrue();
            test.bool(recipe.hasRule('ruleB')).isTrue();
        });
    });
});
