import { JSDOM } from 'jsdom';
import { renderFile } from 'ejs';
import { ncp } from 'ncp';

ncp.limit = 16;

const {
  existsSync, lstatSync, readdirSync, readFile, writeFile, mkdirSync,
} = require('fs');
const { join, dirname, basename } = require('path');

const DefaultOpts = {
  template: `${__dirname}/../templates/simple.html`,
  source: null,
  dest: null,
  destTitle: null,
  headerNumber: 1,
  destFolder: 'DrExplain',
};

const isDirectory = source => lstatSync(source).isDirectory();
const isObject = obj => typeof obj === 'object';
const NotNullEmpty = str => str !== null && str !== undefined && str !== '';
const NotNull = obj => obj !== null && obj !== undefined;

function getDirectories(source) {
  return readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory)
    .map(d => basename(d));
}

function MkDirDest(dest, folder) {
  if (existsSync(dest) && !isDirectory(dest)) {
    return null;
  }

  const destPath = `${dest}/${folder}`;

  if (!existsSync(destPath)) {
    mkdirSync(destPath, { recursive: true });
  }

  return destPath;
}

function CopyDirectories(source, dest) {
  const sourceDir = dirname(source);

  getDirectories(sourceDir).forEach((dir) => {
    ncp(`${sourceDir}/${dir}`, `${dest}/${dir}`, (err) => {
      if (err) {
        return console.error(err);
      }

      return null;
    });
  });
}

function StepData(step) {
  const firstChildren = step.children[0];
  const secondChildren = firstChildren.children[0];

  let data;

  if (NotNullEmpty(secondChildren)) {
    const isHeader = secondChildren.className.indexOf('section-heading') > -1;
    data = { content: '', title: secondChildren.innerHTML, header: isHeader};
  } else {
    let title;
    if (firstChildren.nodeName === 'H3') {
      title = firstChildren.innerHTML;
      step.removeChild(firstChildren);
    }
    data = { content: step.innerHTML, title, header: false };
  }

  return data;
}

function Renderer(opts, data, i, cb) {
  renderFile(opts.template, data, {}, (err2, str) => {
    if (err2 !== null) {
      cb(null);
    }

    if (data.header === true) {
      const newOpts = opts;
      const index = (newOpts.headerNumber < 10) ? `0${newOpts.headerNumber}` : newOpts.headerNumber;
      newOpts.destTitle = `${newOpts.dest}/${index}. ${data.title}`;
      newOpts.headerNumber += 1;
      if (!existsSync(newOpts.destTitle)) {
        mkdirSync(newOpts.destTitle);
        cb(newOpts);
      }
    } else {
      const index = (i < 10) ? `0${i + 1}` : i + 1;
      const fileName = `page_${index}.html`;
      const basePath = NotNullEmpty(opts.destTitle) ? opts.destTitle : opts.dest;
      writeFile(`${basePath}/${fileName}`, str, (err3) => {
        if (err3) {
          console.log(err3);
          cb(null);
        }

        return cb(null);
      });
    }
  });
}

function Worker(opts) {
  readFile(opts.source, 'utf8', (err, contents) => {
    if (NotNullEmpty(err)) {
      return;
    }

    const dom = new JSDOM(contents);
    const steps = dom.window.document.querySelectorAll('.step');
    let newOpts = opts;

    steps.forEach((step, i) => {
      const data = StepData(step);

      Renderer(newOpts, data, i, (updatedOpts) => {
        if (NotNull(updatedOpts)) {
          newOpts = updatedOpts;
        }
      });
    });
  });
}

function ConvertStepShot(userOpts) {
  let opts = userOpts;

  if (!NotNull(opts) || !isObject(opts)) {
    opts = {};
  }

  opts = Object.assign({}, DefaultOpts, opts);

  if (!NotNullEmpty(opts.source) || !NotNullEmpty(opts.dest)) {
    return null;
  }

  if (!NotNullEmpty(opts.template)) {
    opts.template = DefaultOpts.template;
  }

  if (!existsSync(opts.source)) {
    return null;
  }

  if (isDirectory(opts.source)) {
    opts.source = `${opts.source}/index.html`;
  }

  opts.dest = MkDirDest(opts.dest, opts.destFolder);

  CopyDirectories(opts.source, opts.dest);
  Worker(opts);

  return true;
}

export default ConvertStepShot;
