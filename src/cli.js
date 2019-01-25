#!/usr/bin/env node

import program from 'commander';
import ConvertStepShot from '../lib/index';

const pjson = require('../package.json');

const NotNullEmpty = str => str !== null && str !== undefined && str !== '';

program
  .version(pjson.version, '-v, --version');

program
  .option('-t, --template [template]', 'HTML Template path.')
  .option('-s, --source <source>', 'StepShot source.')
  .option('-d, --dest <dest>', 'Destination for Dr.Explain files.');

program
  .parse(process.argv);

if (NotNullEmpty(program.source) && NotNullEmpty(program.dest)) {
  const data = {
    source: program.source,
    dest: program.dest,
    template: program.template,
  };

  if (ConvertStepShot(data) !== null) {
    console.log('Converting success!');
  } else {
    console.error('Converting failed!');
  }
}
