var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var CallHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode('call', {
      func: node.expression,
      args: new UglifyJS.AST_Array({elements: node.args})
    });
  }
};

module.exports = CallHandler;
