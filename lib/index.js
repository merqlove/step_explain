"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsdom = require("jsdom");

var _ejs = require("ejs");

var _ncp = require("ncp");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

_ncp.ncp.limit = 16;

var _require = require('fs'),
    existsSync = _require.existsSync,
    lstatSync = _require.lstatSync,
    readdirSync = _require.readdirSync,
    readFile = _require.readFile,
    writeFile = _require.writeFile,
    mkdirSync = _require.mkdirSync;

var _require2 = require('path'),
    join = _require2.join,
    dirname = _require2.dirname,
    basename = _require2.basename;

var DefaultOpts = {
  template: "".concat(__dirname, "/../templates/simple.html"),
  source: null,
  dest: null,
  destTitle: null,
  headerNumber: 1,
  destFolder: 'DrExplain'
};

var isDirectory = function isDirectory(source) {
  return lstatSync(source).isDirectory();
};

var isObject = function isObject(obj) {
  return _typeof(obj) === 'object';
};

var NotNullEmpty = function NotNullEmpty(str) {
  return str !== null && str !== undefined && str !== '';
};

var NotNull = function NotNull(obj) {
  return obj !== null && obj !== undefined;
};

function getDirectories(source) {
  return readdirSync(source).map(function (name) {
    return join(source, name);
  }).filter(isDirectory).map(function (d) {
    return basename(d);
  });
}

function MkDirDest(dest, folder) {
  if (existsSync(dest) && !isDirectory(dest)) {
    return null;
  }

  var destPath = "".concat(dest, "/").concat(folder);

  if (!existsSync(destPath)) {
    mkdirSync(destPath, {
      recursive: true
    });
  }

  return destPath;
}

function CopyDirectories(source, dest) {
  var sourceDir = dirname(source);
  getDirectories(sourceDir).forEach(function (dir) {
    (0, _ncp.ncp)("".concat(sourceDir, "/").concat(dir), "".concat(dest, "/").concat(dir), function (err) {
      if (err) {
        return console.error(err);
      }

      return null;
    });
  });
}

function StepData(step) {
  var firstChildren = step.children[0];
  var secondChildren = firstChildren.children[0];
  var data;

  if (NotNullEmpty(secondChildren)) {
    var isHeader = secondChildren.className.indexOf('section-heading') > -1;
    data = {
      content: '',
      title: secondChildren.innerHTML,
      header: isHeader
    };
  } else {
    var title;

    if (firstChildren.nodeName === 'H3') {
      title = firstChildren.innerHTML;
      step.removeChild(firstChildren);
    }

    data = {
      content: step.innerHTML,
      title: title,
      header: false
    };
  }

  return data;
}

function Renderer(opts, data, i, cb) {
  (0, _ejs.renderFile)(opts.template, data, {}, function (err2, str) {
    if (err2 !== null) {
      cb(null);
    }

    if (data.header === true) {
      var newOpts = opts;
      newOpts.destTitle = "".concat(newOpts.dest, "/").concat(newOpts.headerNumber, ". ").concat(data.title);
      newOpts.headerNumber += 1;

      if (!existsSync(newOpts.destTitle)) {
        mkdirSync(newOpts.destTitle);
        cb(newOpts);
      }
    } else {
      var index = i < 10 ? "0".concat(i + 1) : i + 1;
      var fileName = "page_".concat(index, ".html");
      var basePath = NotNullEmpty(opts.destTitle) ? opts.destTitle : opts.dest;
      writeFile("".concat(basePath, "/").concat(fileName), str, function (err3) {
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
  readFile(opts.source, 'utf8', function (err, contents) {
    if (NotNullEmpty(err)) {
      return;
    }

    var dom = new _jsdom.JSDOM(contents);
    var steps = dom.window.document.querySelectorAll('.step');
    var newOpts = opts;
    steps.forEach(function (step, i) {
      var data = StepData(step);
      Renderer(newOpts, data, i, function (updatedOpts) {
        if (NotNull(updatedOpts)) {
          newOpts = updatedOpts;
        }
      });
    });
  });
}

function ConvertStepShot(userOpts) {
  var opts = userOpts;

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
    opts.source = "".concat(opts.source, "/index.html");
  }

  opts.dest = MkDirDest(opts.dest, opts.destFolder);
  CopyDirectories(opts.source, opts.dest);
  Worker(opts);
  return true;
}

var _default = ConvertStepShot;
exports.default = _default;