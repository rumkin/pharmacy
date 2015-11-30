# Pharmacy

Pharmacy is a library for building validators and sanitizers. It is powered with
promises to make all operations fully asynchronous.

Pharmacy has several entities Store, Recipe, Rule, Field and Report. Store contains
complete validation and sanitizing recipes. Recipe contains rules. Rule
allow to validate or sanitize passed value. Field unites recipe and value
to validate and generate report.

## Basic example

Let's create number validator and try to validate different values.

```javascript
var pharmacy = require('pharmacy');

var store = new pharmacy.Store({
  rules: {
    // Check if value is number and it's acceptable.
    isNumber(accept, value) {
      return (typeof value === 'number') === accept;
    }
  }
});

// Validate number, expect a number
store
  .validate(10, {isNumber: true})
  .then(report => {
    report.isValid(); // -> true
    report.value; // -> 10
  });

// Validate string, expect a number
store
  .validate("10", {isNumber: true})
  .then(report => {
    report.isValid(); // -> false
    report.value; // -> "10"
  });

// Validate null, expect NOT a number
store
  .validate(null, {isNumber: false})
  .then(report => {
    report.isValid(); // -> true
    report.value; // -> null
  });
```

## Complex example

Create independent rule and recipes. Add them to store and validate values using
recipe by name.

```javascript
var pharmacy = require('pharmacy');

var store = new pharmacy.Store();

// Create and add the rule.
var isBool = new pharmacy.Rule({
  // Extend field object methods.
  field(field) {
    field.isBool = function () {
      return typeof this.value === 'boolean';
    };
  },
  // Sanitizer could convert values from string to acceptable value.
  sanitize(accept, value) {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    return value;
  },
  // Validate the value after sanitizing.
  validate(accept, value, field) {
    return  field.isBool() === accept;
  }
});

store.addRule('isBool', isBool);

// Create and add the recipe.
var recipe = new pharmacy.Recipe({
  isBool: true
});

store.addRecipe('isTrue', recipe);

// Use recipe
store
  .validate(true, 'isTrue')
  .then(report => {
    report.isValid(); // -> true
    report.value; // -> true
  });

// Use recipe
store
  .validate(10, 'isTrue')
  .then(report => {
    report.isValid(); // -> false
    report.value; // -> 10
  });
```
