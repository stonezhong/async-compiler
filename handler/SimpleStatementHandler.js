var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var SimpleStatementHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'simpleStatement',
      {body: node.body},
      this.appTransformer
    );
  }
};

module.exports = SimpleStatementHandler;
