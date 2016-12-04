// Pharmacy components:
exports.Store = require('./store.js');
exports.Recipe = require('./recipe.js');
exports.Report = require('validation-report');
exports.Field = require('./field.js');
exports.Rule = require('./rule.js');
exports.Error = require('./error.js');

if (typeof window === 'object') {
    window.pharmacy = exports;
}
