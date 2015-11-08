var test = require('unit.js');
var Pharmacy = require('../src/pharmacy');

describe('Pharmacy store object', function () {
    it('Should add rules on creation', function () {
        var store = new Pharmacy.Store({
            rules: {
                isTrue: function (accept, value) {
                    return (value === true) === accept;
                }
            }
        });

        test.bool(store.hasRule('isTrue')).isTrue();
    });

    it('Should throw on getting unexcistent rule', function () {
        var store = new Pharmacy.Store();

        test.function(function () {
            store.getRule('isTrue');
        }).throws(Error);
    });

    it('Should add new rule', function () {
        var store = new Pharmacy.Store();

        store.addRule('equal', function (accept, value) {
            return accept === value;
        });

        test.bool(store.hasRule('equal')).isTrue();
    });

    it('Should not throw on finding unexcistent rule', function () {
        var store = new Pharmacy.Store();

        var result = store.findRule('someRule');
        test.value(result).is(undefined);
    });

    it('Should convert objects to Pharmacy.Rule', function () {
        var store = new Pharmacy.Store({
            rules: {
                type(accept, value) {
                    return typeof value === accept;
                }
            }
        });

        test.object(store.getRule('type')).isInstanceOf(Pharmacy.Rule);
    });

    it('Should add recipe on creation', function () {
        var store = new Pharmacy.Store({
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
        var store = new Pharmacy.Store({
            rule: {
                type: function (accept, value) {
                    return typeof value === accept;
                }
            }
        });

        store.addRecipe('string', {type: 'string'});
    });

    it('Should get recipe', function () {
        var store = new Pharmacy.Store({
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
        var store = new Pharmacy.Store();

        test.function(function () {
            store.getRecipe('notExists');
        }).throws(Error);
    });

    it('Should convert object recipe to Pharmacy.Recipe', function () {
        var store = new Pharmacy.Store({
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

        test.object(recipe).isInstanceOf(Pharmacy.Recipe);
    });

    it('Should not throw on finding unexcistent recipe', function () {
        var store = new Pharmacy.Store();

        var result = store.findRecipe('someRule');
        test.value(result).is(undefined);
    });

    it('Should return promise on validate', function () {
        var store = new Pharmacy.Store({
            rule: {
                type(accept, value) {
                    return typeof value === accept;
                }
            }
        });

        test.object(store.validate('hello', {type: 'string'})).isInstanceOf(Promise);
    });

    it('Should validate recipe as object', function () {
        var store = new Pharmacy.Store({
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
        var store = new Pharmacy.Store({
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
        var store = new Pharmacy.Store({
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

    it('Sanitize method should return a promise', function () {
        var store = new Pharmacy.Store({
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
        var store = new Pharmacy.Store({
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

    it('Should throw Pharmacy.Error on sanitation if data is invalid', function () {
        var store = new Pharmacy.Store({
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
            test.object(error).isInstanceOf(Pharmacy.Error);
        });
    });
});
