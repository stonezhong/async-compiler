var UglifyJS = require('uglify-js');
var HandlerTool = require('./HandlerTool');

var VarHandler = {
  handle: function(node, descend) {
    descend(node, this);
    var transformer = this.appTransformer;

    var elements = [];
    for (var i = 0; i < node.definitions.length; i ++) {
      var definition = node.definitions[i];
      elements.push(getVarDef(definition.name, definition.value));
    }

    return HandlerTool.buildNode(
      'var',
      { defs: new UglifyJS.AST_Array({elements: elements}) },
      this.appTransformer
    );
  }
};

function getVarDef(name, value) {
  var properties = [ ];

  properties.push(
    new UglifyJS.AST_ObjectKeyVal({
      key: 'name',
      value:  new UglifyJS.AST_String({value: name.name})
    })
  );

  properties.push(
    new UglifyJS.AST_ObjectKeyVal({
      key: 'value',
      value:  value
    })
  );

  return new UglifyJS.AST_Object({properties: properties});
}

module.exports = VarHandler;
