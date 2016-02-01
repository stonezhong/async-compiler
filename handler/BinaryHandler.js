var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var BinaryHandler = {
  handle: function(node, descend) {
    descend(node, this);

    var operator = new UglifyJS.AST_String({value: node.operator})
    return HandlerTool.buildNode('binary', {
      operator: operator,
      left: node.left,
      right: node.right
    });
  }
};

module.exports = BinaryHandler;
