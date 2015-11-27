var inspect = require('util').inspect;

var Pharmacy = require('pharmacy');

var store = new Pharmacy.Store({
    field: {
        isBool() {
            return typeof this.value === 'boolean';
        }
    },
    rules: {
        // Primitive type check
        isBool(accept, value, field) {
            return field.isBool();
        },
        equals(accept, value) {
            if (value === accept) {
                return true;
            }

            return {
                path: [],
                value: value,
                accept: accept,
                got: value
            };
        },

    }
});

// Validate value for equation.
store.validate(1, {equals: 1})
    .then(result => {
        console.log(inspect(result, {colors: true}));
    }).catch(error => {
        console.error(error.stack);
    });

// Chek if value is boolean
store.validate(false, {isBool: true})
    .then(result => {
        console.log(inspect(result, {colors: true}));
    }).catch(error => {
        console.error(error.stack);
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

// Check if value is string
store.validate('Hello', {isString: true})
    .then(result => {
        console.log(inspect(result, {colors: true}));
    }).catch(error => {
        console.error(error.stack);
    });

// Add validation result
store.addRecipe('true', {
    isBool: true,
    equals: true
});

// Get validation recipe by name
store.validate(true, 'true')
    .then(result => {
        console.log(inspect(result, {colors: true}));
    }).catch(error => {
        console.error(error.stack);
    });
