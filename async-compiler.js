var Transformer = require('./transformer/Transformer.js');
var UglifyJS = require('uglify-js');
var ParserTool = require('./parserTool.js');


function compile(source, options) {
  if (options.dumpAstOnly) {
    dumpAst(source, options);
    return "";
  }

  var ast = UglifyJS.parse(source, {});

  var transformer = new Transformer();
  transformer.transform(ast);

  var out = UglifyJS.OutputStream({ beautify: true });
  ast.print(out);
  return out.toString() + "\n";
}

function dumpAst(source, options) {
  var ast = UglifyJS.parse(source, {});

  var indent = 0;
  function getIndent() {
    var s = '';
    for (var i = 0; i < indent; i ++) {
      s += ' ';
    }
    return s;
  }

  ast.walk(
    new UglifyJS.TreeWalker(function(node, descend) {
      console.log(getIndent() + ParserTool.findNodeType(node));
      indent += 2;
      descend();
      indent -= 2;
      return true;
    })
  );
}

var AsyncCompiler = {
  compile: compile,
  dumpAst: dumpAst,
};

function before(node, descend) {
  return ;
}

module.exports = AsyncCompiler;
