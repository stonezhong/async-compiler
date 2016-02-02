var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var PostUnaryHandler = {
  handle: function(node, descend) {
    descend(node, this);

    return HandlerTool.buildNode('unary', {
      operator: new UglifyJS.AST_String({value: node.operator}),
      isPost: new UglifyJS.AST_True({}),
      expr: node.expression,
    });
  }
};

module.exports = PostUnaryHandler;
