var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var TryHandler = {
  handle: function(node, descend) {
    descend(node, this);

    var props = {
      body  : new UglifyJS.AST_Array({elements: node.body}),
    };
    if (node.bcatch !== null) {
      props.bcatch = node.bcatch;
    }
    if (node.bfinally !== null) {
      props.bfinally = node.bfinally;
    }

    return HandlerTool.buildNode('try', props);
  }
};

module.exports = TryHandler;
