var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var FinallyHandler = {
  handle: function(node, descend) {

    descend(node, this);
    return HandlerTool.buildNode(
      'finally',
      {
        body: new UglifyJS.AST_Array({elements: node.body}),
      }
    );
  }
};

module.exports = FinallyHandler;
