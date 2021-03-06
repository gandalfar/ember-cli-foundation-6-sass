/* jshint node:true */

var fs          = require('fs');
var path        = require('path');
var bower       = require(path.resolve(__dirname, '../../bower.json'));
var VersionChecker = require('ember-cli-version-checker');

module.exports = {
  description: 'install ember-cli-foundation-6-sass into a typical project',
  normalizeEntityName: function() {},

  beforeInstall: function () {
    return this.addBowerPackageToProject('foundation-sites', bower.dependencies['foundation-sites']);
  },

  afterInstall: function () {
    // Copy the _settings.scss file
    var stylePath = path.join(process.cwd(), 'app', 'styles');
    var foundationPath = path.join(process.cwd(), 'bower_components', 'foundation-sites', 'scss');
    var settingsPath = path.join(foundationPath, 'settings', '_settings.scss');
    var checker = new VersionChecker(this);
    var isGTE6_3_0 = checker.for('foundation-sites', 'bower').satisfies('>=6.3.0');
    var settingsFile = fs.readFileSync(settingsPath);
    var settingsFilePath = path.join(stylePath, '_settings.scss');
    var appFile, appFilePath;

    if (isGTE6_3_0) {
      //edit app.scss to change @import 'foundation'; with @import 'foundation-sites/foundation';
      appFilePath = path.join(stylePath, 'app.scss');
      appFile = fs.readFileSync(appFilePath, 'utf-8');

      appFile = appFile.replace('@import \'foundation\';', '@import \'foundation-sites/foundation\';');

      fs.writeFileSync(appFilePath, appFile);

      //edit settingsFile contents to replace @import 'util/util'; with @import 'foundation-sites/util/util';
      settingsFile = settingsFile.toString('utf-8').replace('@import \'util/util\';', '@import \'foundation-sites/util/util\';');

      this._writeInfoLine('Updated ' + appFilePath + ' with correct foundation import path (see https://github.com/acoustep/ember-cli-foundation-6-sass/issues/40).');
      this._writeInfoLine('Updated ' + settingsFilePath + ' with correct foundation import path (see https://github.com/acoustep/ember-cli-foundation-6-sass/issues/40).');
    }

    fs.writeFileSync(settingsFilePath, settingsFile);

    return this.addPackagesToProject([
      { name: 'ember-cli-sass', target: '^6.0.0' },
      { name: 'broccoli-clean-css', target: '~1.1.0' }
    ]);
  },

  /**
   A wrapper method to write a message with writeWarnLine or writeLine, depending on which version
   of ember-cli is used

   @param {string} msg Message to print
   */
    _writeInfoLine: function(msg) {
        if (this.ui.writeWarnLine) {
            this.ui.writeWarnLine(msg);
        } else {
            this.ui.writeLine(msg, 'INFO');
        }
    }
};
