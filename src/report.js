;(function () {
  'use strict';

  var Pharmacy;
  if (typeof module === 'object' && 'exports' in module) {
    module.exports = Report;
    Pharmacy = require('./pharmacy.js');
  } else if (typeof window === 'object' && this === window) {
    window.Pharmacy.Report = Report;
    Pharmacy = window.Pharmacy;
  }

  function Report(options) {
    options = options || {};
    this.issues = options.issues || [];
    this.value = options.value;
  }

  Report.prototype.isValid = function () {
    return this.issues.length === 0;
  };
})();
