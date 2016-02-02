var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

function buildEmptyStatement() {
  return HandlerTool.buildNode(
    'block',
    {
      children: new UglifyJS.AST_Array({elements: []})
    }
  )
}

function buildLiteralTrueExpression() {
  return HandlerTool.buildNode(
    'ref',
    {
      literal: new UglifyJS.AST_True({}),
      refType: new UglifyJS.AST_String({value: 'literal'})
    }
  );
}

var ForHandler = {
  handle: function(node, descend) {
    descend(node, this);

    var init = node.init || buildEmptyStatement();
    var condition = node.condition || buildLiteralTrueExpression();
    var step = node.step || buildEmptyStatement();

    return HandlerTool.buildNode(
      'for',
      {
        init: init,
        condition: condition,
        step: step,
        body: node.body,
      }
    );
  }
};

module.exports = ForHandler;
