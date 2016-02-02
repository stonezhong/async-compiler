var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var IfHandler = {
  handle: function(node, descend) {
    descend(node, this);

    var falseBranch = node.alternative;
    if (falseBranch === null) {
      falseBranch = HandlerTool.buildNode(
        'block',
        {
          children: new UglifyJS.AST_Array({elements: []})
        }
      );
    }

    return HandlerTool.buildNode(
      'if',
      {
        condition: node.condition,
        trueBranch: node.body,
        falseBranch: falseBranch
      }
    );
  }
};

module.exports = IfHandler;
