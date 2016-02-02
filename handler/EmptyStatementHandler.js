var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var EmptyStatementHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'block',
      {
        children: new UglifyJS.AST_Array({elements: []})
      }
    );
  }
};

module.exports = EmptyStatementHandler;
