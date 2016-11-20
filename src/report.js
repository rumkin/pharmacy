'use strict';

module.exports = Report;

/**
 * @typedef {object} ReportIssue
 * @property {string[]} path issue path.
 * @property {string} rule Failed rule name.
 * @property {*} value Value caused an issue.
 * @property {*} accept Value that is acceptable.
 * @property {*} current Value returned by validation method.
 */

/**
 * Validation report object.
 *
 * @param {{issues:object[],value:*}} options Validation report params.
 * @constructor
 */
function Report(options) {
    options = options || {};
    this.issues = options.issues || [];
    this.value = options.value;
    this.checks = 0;
}

/**
 * Check if report has no issues.
 * @return {Boolean}
 */
Report.prototype.isValid = function () {
    return this.issues.length === 0;
};

/**
 * Add issue to issue list.
 *
 * @param  {ReportIssue} issue Issue object instance.
 */
Report.prototype.addIssue = function (issue) {
    this.issues.push(issue);
};

/**
 * Check if report has a specified issue.
 *
 * @param  {string|string[]}  path Array of keys or path koined with a dot.
 * @return {Boolean}      Return true if there is at list one issue.
 */
Report.prototype.hasIssue = function(path) {
    let p;
    if (Array.isArray(path)) {
        p = path.join('.');
    } else {
        p = path;
    }

    for (let issue of this.issues) {
        if (issue.path.join('.') === p) {
            return true;
        }
    }

    return false;
};
