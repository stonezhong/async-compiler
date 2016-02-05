var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var ObjectHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode('object', {
      properties: new UglifyJS.AST_Array({elements: node.properties})
    });
  }
};

module.exports = ObjectHandler;
