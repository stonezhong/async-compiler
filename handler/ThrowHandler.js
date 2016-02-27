var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var ThrowHandler = {
  handle: function(node, descend) {
    descend(node, this);
    return HandlerTool.buildNode(
      'throw',
      {value: node.value}
    );
  }
};

module.exports = ThrowHandler;
