var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var NumberHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'ref',
      {
        literal: node,
        refType: new UglifyJS.AST_String({value: 'literal'})
      }
    );
  }
};

module.exports = NumberHandler;
