var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var DoHandler = {
  handle: function(node, descend) {
    descend(node, this);

    return HandlerTool.buildNode(
      'do',
      {
        condition: node.condition,
        body: node.body,
      }
    );
  }
};

module.exports = DoHandler;
