var inspect = require('util').inspect;

var Pharmacy = require('../src/pharmacy.js');

var store = new Pharmacy.Store({
    field: {
        isObject() {
            return (typeof this.value === 'object' && this.value !== null);
        },
        isString() {
            return (typeof this.value === 'string');
        },
        isBoolean() {
            return typeof this.value === 'boolean';
        },
        isNull() {
            return this.value === null;
        }
    },
    rules: {
        // Primitive type check
        isBool: {
            filter(accept, value, field) {
                if (! field.isBoolean() && field.recipe.rules.convertType) {
                    switch (typeof value) {
                        case 'string':
                            value = (value === 'true' || value === 'yes');
                        break;
                        default:
                            value = !! value;
                    }
                }

                return value;
            },
            validate(accept, value, field) {
                return field.isBoolean() === accept;
            }
        },
        // Nested check properties
        props(accept, value, field) {
            if (! field.isObject()) {
                return false;
            }

            var keys = Object.getOwnPropertyNames(accept);

            return Promise.all(keys.map(name => {
                return field.child(name, value[name], accept[name]).validate();
            })).then(function (reports) {
                var value = {};

                var report = new Pharmacy.Report({
                    issues: reports.reduce((issues, report, i) => {
                        value[keys[i]] = report.value;
                        return issues.concat(report.issues);
                    }, []),
                    value: value
                });

                return report;
            });
        },
        // Nested check of array items
        each(accept, value, field) {
            if (Array.isArray(accept)) {
                return false;
            }

            return Promise.all(value.map((value, i) => {
                return field.child(i, value, accept).validate();
            })).then((reports) => {
                var result = new Array(value.length);

                var report = new Pharmacy.Report({
                    issues: reports.reduce((issues, report, i) => {
                        result[i] = report.value;
                        return issues.concat(report.issues);
                    }, []),
                    value: result
                });

                return report;
            });
        }
    }
});

// Add rule exapmple
store.addRule('isString', {
    // Custom extend method field
    field (field) {
        field.isString = function () {
            return typeof this.value === 'string';
        }
    },
    validate: function (accept, value, field) {
        return field.isString() === accept;
    }
});

// validate string
store.validate('hello', [{isString: true}]).then(function (report) {
    console.log('Is valid', report.isValid());
    console.log(inspect(report, {colors: true}));
}).catch(function (error) {
    console.error(error.stack);
});

// Validate boolean
store.validate(false, {isBool: true}).then(function (report) {
    console.log('Is valid', report.isValid());
    console.log(inspect(report, {colors: true}));
}).catch(function (error) {
    console.error(error.stack);
});

// Validate object
store.validate({a: 1}, {props: {a:{isBool:true}}}).then(function (report) {
    console.log('Is valid', report.isValid());
    console.log(inspect(report, {colors: true}));
}).catch(function (error) {
    console.error(error.stack);
});

// Validate array
store.validate(['a1', 'a2', 'a3', null], {each: {isString: true}})
.then(function (report) {
    console.log('Is valid', report.isValid());
    console.log(inspect(report, {colors: true, depth: 5}));
}).catch(function (error) {
    console.error(error.stack);
});

// Check custom rule
store.validate('a1', {isA1: new Pharmacy.Rule(function (accept, value) {
    return value === 'a1';
})})
.then(function (report) {
    console.log('Is valid', report.isValid());
    console.log(inspect(report, {colors: true, depth: 5}));
}).catch(function (error) {
    console.error(error.stack);
});

store.addRecipe('boolean', {
    convertType: true,
    isBool: true
});

// Sanitation example: convert `'yes'` to `true`.
store.sanitize('yes', 'boolean').then(function (result) {
    console.log('Sanitation result is', inspect(result, {colors: true}));
}).catch(function (error) {
    console.error(error.stack);
});
