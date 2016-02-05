var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var ObjectPropertyHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode('property', {
      key: new UglifyJS.AST_String({value: node.key}),
      value: node.value
    });
  }
};

module.exports = ObjectPropertyHandler;
