var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var WhileHandler = {
  handle: function(node, descend) {
    descend(node, this);

    return HandlerTool.buildNode(
      'while',
      {
        condition: node.condition,
        body: node.body,
      }
    );
  }
};

module.exports = WhileHandler;
