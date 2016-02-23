var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var NewHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode('new', {
      func: node.expression,
      args: new UglifyJS.AST_Array({elements: node.args})
    });
  }
};

module.exports = NewHandler;
