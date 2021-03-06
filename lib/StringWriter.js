'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var autils = require('./AUtils');

var StringWriter = function (config, outputText, ext) {

  if (typeof outputText !== "string") {
    throw new Error("The outputText provided is not a 'string' value but is a typeof " + (typeof outputText));
  }

  this.config = config;
  this.ext = ext || "txt";
  this.outputText = outputText;
};

var lineEndingRegex = new RegExp("\r?\n", "g"); //eslint-disable-line no-control-regex
function normalizeLineEndings(lineEnding, value) {
  if (autils.isBinaryFile(value)) {
    return value;
  }
  return value.replace(lineEndingRegex, lineEnding);
}

StringWriter.prototype.getFileExtension = function () {
  return this.ext;
};

StringWriter.prototype.write = function (filePath) {

  var dir = path.dirname(path.normalize(filePath));
  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir);
  }

  if (this.config.normalizeLineEndingsTo !== false && this.config.normalizeLineEndingsTo !== undefined) {
    this.outputText = normalizeLineEndings(this.config.normalizeLineEndingsTo, this.outputText);
  }

  if (this.config.appendEOL) {

    var CRLF = "\r\n";
    var LF = "\n";

    var endsWithCRLF = this.outputText && this.outputText.length >= 2 &&
      this.outputText[this.outputText.length - 2] === CRLF[0] &&
      this.outputText[this.outputText.length - 1] === CRLF[1];
    var endsWithLF = this.outputText && this.outputText.length >= 1 &&
      this.outputText[this.outputText.length - 1] === LF;

    if (!endsWithCRLF && !endsWithLF) {
      console.log("ADDING EOL - " + JSON.stringify(this.config.EOL));
      this.outputText += this.config.EOL;
    } else if (endsWithCRLF && this.config.EOL === LF) {
      console.log("NOT ADDING EOL - " + JSON.stringify(this.config.EOL) + ' because ' + JSON.stringify(LF) + ' already there.');
    } else if (endsWithLF && this.config.EOL === CRLF) {
      console.log("NOT ADDING EOL - " + JSON.stringify(this.config.EOL) + ' because ' + JSON.stringify(CRLF) + ' already there.');
    }

  }
  fs.writeFileSync(filePath, this.outputText);
};

module.exports = StringWriter;
