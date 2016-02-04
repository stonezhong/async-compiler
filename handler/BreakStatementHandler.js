var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var BreakStatementHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'break',
      {}
    );
  }
};

module.exports = BreakStatementHandler;
