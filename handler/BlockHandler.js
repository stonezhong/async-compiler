var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var BlockHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'block',
      {
        children: new UglifyJS.AST_Array({elements: node.body})
      }
    );
  }
};

module.exports = BlockHandler;
