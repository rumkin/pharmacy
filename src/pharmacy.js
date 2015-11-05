void function () {
  if (typeof module === 'object' && 'exports' in module) {
    exports.Store = require('./store.js');
    exports.Recipe = require('./recipe.js');
    exports.Report = require('./report.js');
    exports.Field = require('./field.js');
    exports.Rule = require('./rule.js');

  } else if (typeof window === 'object' && this === window) {
    window.Pharmacy = {};
  }
}();
