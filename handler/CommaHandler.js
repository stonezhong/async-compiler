var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var CommaHandler = {
  handle: function(node, descend) {
    descend(node, this);

    return HandlerTool.buildNode(
      'seq',
      {
        first: node.car,
        last:  node.cdr,
      }
    );
  }
};

module.exports = CommaHandler;
