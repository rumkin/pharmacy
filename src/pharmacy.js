void function () {
  if (typeof module === 'object' && 'exports' in module) {
    exports.Store = require('./store.js');
    exports.Rule = require('./rule.js');

  } else if (typeof window === 'object' && this === window) {
    window.Pharmacy = {};
  }
}();
