var UglifyJS = require('uglify-js');

function buildNode(type, options) {
  var properties = [ ];

  properties.push(
    new UglifyJS.AST_ObjectKeyVal({
      key:    'type',
      value:  new UglifyJS.AST_String({value: type})
    })
  );

  for (var key in options) {
    properties.push(
      new UglifyJS.AST_ObjectKeyVal({
        key: key,
        value:  options[key]
      })
    );
  }

  return new UglifyJS.AST_Object({properties: properties});
}

// build node for symbol 'undefined'
function buildUndefinedSymReference() {
  return buildNode(
    'ref',
    {
      refType: new UglifyJS.AST_String({value: 'external'}),
      name: new UglifyJS.AST_String({value: 'undefined'})
    }
  );
}

var HandlerTool = {
  buildNode: buildNode,
  buildUndefinedSymReference: buildUndefinedSymReference,
};


module.exports = HandlerTool;
