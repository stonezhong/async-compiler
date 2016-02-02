var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var PreUnaryHandler = {
  handle: function(node, descend) {
    descend(node, this);

    return HandlerTool.buildNode('unary', {
      operator: new UglifyJS.AST_String({value: node.operator}),
      isPost: new UglifyJS.AST_False({}),
      expr: node.expression,
    });
  }
};

module.exports = PreUnaryHandler;
