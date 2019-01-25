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
    data = {
      content: '',
      title: secondChildren.innerHTML
    };
  } else {
    var title;

    if (firstChildren.nodeName === 'H3') {
      title = firstChildren.innerHTML;
      step.removeChild(firstChildren);
    }

    data = {
      content: step.innerHTML,
      title: title
    };
  }

  return data;
}

function Renderer(opts, data, i) {
  (0, _ejs.renderFile)(opts.template, data, {}, function (err2, str) {
    if (err2 !== null) {
      return;
    }

    var fileName = "page_".concat(i + 1, ".html");
    writeFile("".concat(opts.dest, "/").concat(fileName), str, function (err3) {
      if (err3) {
        return console.log(err3);
      }

      return null;
    });
  });
}

function Worker(opts) {
  readFile(opts.source, 'utf8', function (err, contents) {
    if (NotNullEmpty(err)) {
      return;
    }

    var dom = new _jsdom.JSDOM(contents);
    var steps = dom.window.document.querySelectorAll('.step');
    steps.forEach(function (step, i) {
      var data = StepData(step);
      Renderer(opts, data, i);
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

  opts.dest = MkDirDest(opts.dest, opts.destFolder);
  CopyDirectories(opts.source, opts.dest);
  Worker(opts);
  return true;
}

var _default = ConvertStepShot;
exports.default = _default;