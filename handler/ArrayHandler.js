var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var ArrayHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode('array', {
      elements: new UglifyJS.AST_Array({elements: node.elements})
    });
  }
};

module.exports = ArrayHandler;
