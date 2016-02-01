var UglifyJS = require('uglify-js');

function buildNode(type, options, transformer) {
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

var HandlerTool = {
  buildNode: buildNode
};


module.exports = HandlerTool;
