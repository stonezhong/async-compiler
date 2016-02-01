var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var SubHandler = {
  handle: function(node, descend) {
    descend(node, this);

    return HandlerTool.buildNode(
      'dot',
      {
        owner: node.expression,
        field: node.property
      }
    );
  }
};

module.exports = SubHandler;
