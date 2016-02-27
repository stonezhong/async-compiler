var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var CatchHandler = {
  handle: function(node, descend) {

    descend(node, this);

    return HandlerTool.buildNode(
      'catch',
      {
        what: new UglifyJS.AST_String({value: node.argname.name}),
        body: new UglifyJS.AST_Array({elements: node.body}),
      }
    );
  }
};

module.exports = CatchHandler;
