var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var ForInHandler = {
  handle: function(node, descend) {
    descend(node, this);

    return HandlerTool.buildNode(
      'forin',
      {
        name: new UglifyJS.AST_String({value: node.name.name}),
        object: node.object,
        body: node.body,
      }
    );
  }
};

module.exports = ForInHandler;
