var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var DotHandler = {
  handle: function(node, descend) {
    descend(node, this);

    var fieldNode = HandlerTool.buildNode(
      'ref',
      {
        literal: new UglifyJS.AST_String({value: node.property}),
        refType: new UglifyJS.AST_String({value: 'literal'})
      }
    );

    return HandlerTool.buildNode(
      'dot',
      {
        owner: node.expression,
        field: fieldNode
      }
    );
  }
};

module.exports = DotHandler;
