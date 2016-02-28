var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var SwitchHandler = {
  handle: function(node, descend) {
    descend(node, this);

    return HandlerTool.buildNode(
      'switch',
      {
        expression: node.expression,
        children: new UglifyJS.AST_Array({elements: node.body})
      }
    );
  }
};

module.exports = SwitchHandler;
