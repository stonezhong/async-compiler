var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var ContinueStatementHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'continue',
      {}
    );
  }
};

module.exports = ContinueStatementHandler;
