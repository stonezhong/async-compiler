var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var ThisHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'ref',
      {
        name: new UglifyJS.AST_String({value: 'this'}),
        refType: new UglifyJS.AST_String({value: 'local'}),
      }
    );
  }
};

module.exports = ThisHandler;
