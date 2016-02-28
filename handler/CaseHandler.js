var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var CaseHandler = {
  handle: function(node, descend) {
    descend(node, this);

    if (node instanceof UglifyJS.AST_Case) {
      return HandlerTool.buildNode(
        'switch-case',
        {
          expression: node.expression,
          children: new UglifyJS.AST_Array({elements: node.body}),
        }
      );
    }

    return HandlerTool.buildNode(
      'switch-default',
      {
        children: new UglifyJS.AST_Array({elements: node.body}),
      }
    );
  }
};

module.exports = CaseHandler;
