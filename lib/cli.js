#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _index = _interopRequireDefault(require("../lib/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pjson = require('../package.json');

var NotNullEmpty = function NotNullEmpty(str) {
  return str !== null && str !== undefined && str !== '';
};

_commander.default.version(pjson.version, '-v, --version');

_commander.default.option('-t, --template [template]', 'HTML Template path.').option('-s, --source <source>', 'StepShot source.').option('-d, --dest <dest>', 'Destination for Dr.Explain files.');

_commander.default.parse(process.argv);

if (NotNullEmpty(_commander.default.source) && NotNullEmpty(_commander.default.dest)) {
  var data = {
    source: _commander.default.source,
    dest: _commander.default.dest,
    template: _commander.default.template
  };

  if ((0, _index.default)(data) !== null) {
    console.log('Converting success!');
  } else {
    console.error('Converting failed!');
  }
}