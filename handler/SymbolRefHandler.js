var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var SymbolRefHandler = {
  handle: function(node, descend) {
    descend(node, this);
    var variableType = this.appTransformer.fam.getVariableType(node.name);
    return HandlerTool.buildNode(
      'ref',
      {
        name: new UglifyJS.AST_String({value: node.name}),
        refType: new UglifyJS.AST_String({value: variableType})
      },
      this.appTransformer
    );
  }
};

module.exports = SymbolRefHandler;
