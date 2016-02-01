var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var ReturnHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'return',
      {value: node.value},
      this.appTransformer
    );
  }
};

module.exports = ReturnHandler;
