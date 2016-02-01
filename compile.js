"use strict";

/**
 * command line options
 * --input <input filename>
 * --output <output filename>
 *
 * if --input is missing, the default input is stdin
 * if --output is missing, the default output is stdout
 **/


var fs = require('fs');
var AsyncCompiler = require('./async-compiler.js');

// dumpAstOnly: if true, only dump the ast node structore
var options = parseCommandLineOptions(process.argv);

// read and compile source code
if ('input' in options) {
  compileSourceAndWriteOutput(fs.readFileSync(options.input, 'utf8'), options);
} else {
  let source = "";
  process.stdin.resume();
  process.stdin.on('data', function(buf) { source += buf.toString(); });
  process.stdin.on('end', function() {
    compileSourceAndWriteOutput(source, options);
  });
}

function compileSourceAndWriteOutput(source, options) {
  var compiledCode = compileSource(source, options);
  if ('output' in options) {
    fs.writeFileSync(options.output, compiledCode, 'utf8');
  } else {
    process.stdout.write(compiledCode);
  }
}

function compileSource(source, options) {
  return AsyncCompiler.compile(source, options);
}

/**
 * parse command line options
 **/
function parseCommandLineOptions(args) {
  var options = {
    dumpAstOnly: false,
  };
  for (var i = 2; i < args.length; i ++) {
    var arg = args[i];
    if (arg === '--input') {
      options.input = args[i + 1];
      i ++;
      continue;
    }
    if (arg === '--output') {
      options.output = args[i + 1];
      i ++;
      continue;
    }
    if (arg === '--dump-ast-only') {
      options.dumpAstOnly = true;
    }
  }
  return options;
}
