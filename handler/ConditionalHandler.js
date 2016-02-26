var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var Conditional = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'conditional',
      {
        condition: node.condition,
        trueBranch: node.consequent,
        falseBranch: node.alternative
      }
    );
  }
};

module.exports = Conditional;
