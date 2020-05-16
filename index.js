"use strict";

var path = require('path');
var spawn = require('child_process').spawn;

function WebpackWebExt(opts) {
  this.argv = opts.argv;
  this.maxRetries = opts.maxRetries;
  this.retries = 0;
  this.runOnce = "runOnce" in opts ? opts.runOnce : true;
  this.webExtPath = opts.webExtPath;
}
module.exports = WebpackWebExt;

WebpackWebExt.prototype.runWebExtCommand = function() {
  var retry = res => {
    if (res instanceof Error) {
      console.error("WebExtRun: command error", this.argv, " - ", res);
    } else {
      console.log("WebExtRun: command exited", this.argv);
    }

    if (this.retries < this.maxRetries) {
      this.retries += 1;
      console.log("WebExtRun: retry", this.retries);
      return this.runWebExtCommand();
    } else {
      if (this.maxRetries > 0) {
        var err = new Error("WebExtRun: Max Retries reached.");
        return Promise.reject(err);
      } else {
        return (res instanceof Error) ? Promise.reject(err) : Promise.resolve();
      }
    }
  };

  return new Promise((resolve, reject) => {
    const webExtChild = spawn(this.webExtPath || "web-ext",
                              this.argv);

    webExtChild.stdout.on('data', (data) => {
      printLogLines("WebExtRun - stdout:", data);
    });

    webExtChild.stderr.on('data', (data) => {
      printLogLines("WebExtRun - stderr:", data, true);
    });

    webExtChild.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`WebExtRun: child process exited with code ${code}`));
      } else {
        resolve();
      }
    });
  }).then(retry, retry).catch((err) => {
    console.error(err);
  });
};

WebpackWebExt.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    if (this.runOnce) {
      if (!this.webExtRunPromise) {
        this.webExtRunPromise = this.runWebExtCommand();
      }
    } else {
      this.runWebExtCommand();
    }

    callback();
  });
};

function printLogLines(prefix, data, isError) {
  var lines = String(data).split("\n");
  for (var line of lines) {
    var msg = `${prefix} ${line}`;
    if (isError) {
      console.error(msg);
    } {
      console.log(msg);
    }
  }
}
