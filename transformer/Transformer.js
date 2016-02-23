var UglifyJS = require('uglify-js');
var FunctionAttributesManager = require('./FunctionAttributesManager');
var ParserTool = require('../parserTool');
var SimpleStatementHandler = require('../handler/SimpleStatementHandler');
var BinaryHandler = require('../handler/BinaryHandler');
var CallHandler = require('../handler/CallHandler');
var StringHandler = require('../handler/StringHandler');
var NumberHandler = require('../handler/NumberHandler');
var SymbolRefHandler = require('../handler/SymbolRefHandler');
var ReturnHandler = require('../handler/ReturnHandler');
var VarHandler = require('../handler/VarHandler');
var DotHandler = require('../handler/DotHandler');
var SubHandler = require('../handler/SubHandler');
var AtomHandler = require('../handler/AtomHandler');
var IfHandler = require('../handler/IfHandler');
var BlockHandler = require('../handler/BlockHandler');
var EmptyStatementHandler = require('../handler/EmptyStatementHandler');
var ForHandler = require('../handler/ForHandler');
var PostUnaryHandler = require('../handler/PostUnaryHandler');
var PreUnaryHandler = require('../handler/PreUnaryHandler');
var WhileHandler = require('../handler/WhileHandler');
var Utility = require('../utility');
var ContinueStatementHandler = require('../handler/ContinueStatementHandler');
var BreakStatementHandler = require('../handler/BreakStatementHandler');
var DoHandler = require('../handler/DoHandler');
var CommaHandler = require('../handler/CommaHandler');
var ObjectHandler = require('../handler/ObjectHandler');
var ObjectPropertyHandler = require('../handler/ObjectPropertyHandler');
var ArrayHandler = require('../handler/ArrayHandler');
var NewHandler = require('../handler/NewHandler');

class Transformer {
  constructor() {
    this.fam = new FunctionAttributesManager();
  }

  transform(ast) {
    var tt = new UglifyJS.TreeTransformer(this.before);
    tt.appTransformer = this;
    ast.transform(tt);
  }

  /* is the function represented by node a async function ?? */
  isAsyncFunction(node) {
    var comments = node.start.comments_before;
    for (var i = 0; i < comments.length; i ++) {
      var comment = comments[i];
      if (comment.value === '* @async *') {
        return true;
      }
    }
    return false;
  }


  // when this function is called, 'this' points to tt (created in transform)
  before(node, descend) {
    var transformer = this.appTransformer;

    // 处理一个函数定义
    if ((node instanceof UglifyJS.AST_Defun) ||
        (node instanceof UglifyJS.AST_Function)) {

      var isAsync = transformer.isAsyncFunction(node);

      // 非异步函数，无须处理
      if (!isAsync) {
        transformer.fam.push({isAsync: false});
        descend(node, this);
        transformer.fam.pop();
        return node;
      }


      transformer.fam.push({ isAsync: isAsync, variables: {}, isPrePass: true });
      for (var i = 0; i < node.argnames.length; i ++) {
        var varName = node.argnames[i].name;
        transformer.fam.setArgumentVariable(varName);
      }

      transformer.fam.setExternalVariable('undefined');
      transformer.fam.setExternalVariable('NaN');


      // 预扫描阶段只是收集下列信息
      // 定义的局部变量
      // 引用的外部变量
      // 参数变量
      // 结果存放在variables中
      descend(node, this);
      transformer.fam.setAttribute('isPrePass', false);
      descend(node, this);
      var functionAttributes = transformer.fam.pop();

      var properties = [ ];
      for (var variable in functionAttributes.variables) {
        if (functionAttributes.variables[variable] === 'external') {
          continue;
        }
        var value = new UglifyJS.AST_SymbolRef({name: 'undefined'});
        if (functionAttributes.variables[variable] === 'argument') {
          value = new UglifyJS.AST_SymbolRef({name: variable});
        }
        properties.push(
          new UglifyJS.AST_ObjectKeyVal({
            key: variable,
            value:  value
          })
        );
      }

      return buildFunctionBody(
        node, new UglifyJS.AST_Object({properties: properties}), functionAttributes
      );
    }

    if (!transformer.fam.getAttribute("isAsync")) {
      return ;
    }

    if (transformer.fam.getAttribute("isPrePass")) {
      if (node instanceof UglifyJS.AST_SymbolRef) {
        transformer.fam.setExternalVariable(node.name);
        return ;
      }

      if (node instanceof UglifyJS.AST_Var) {
        for (var i = 0; i < node.definitions.length; i ++) {
          var definition = node.definitions[i];
          transformer.fam.setLocalVariable(definition.name.name);
        }
        return ;
      }
      return ;
    }


    if (node instanceof UglifyJS.AST_SimpleStatement) {
      return SimpleStatementHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Binary) {
      return BinaryHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Call) {
      if (node instanceof UglifyJS.AST_New) {
        return NewHandler.handle.call(this, node, descend);
      }
      return CallHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_String) {
      return StringHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Number) {
      return NumberHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_SymbolRef) {
      return SymbolRefHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Return) {
      return ReturnHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Var) {
      return VarHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Dot) {
      return DotHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Sub) {
      return SubHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Atom) {
      return AtomHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_If) {
      return IfHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_BlockStatement) {
      return BlockHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_EmptyStatement) {
      return EmptyStatementHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_For) {
      return ForHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_UnaryPostfix) {
      return PostUnaryHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_UnaryPrefix) {
      return PreUnaryHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_While) {
      return WhileHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Continue) {
      return ContinueStatementHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Break) {
      return BreakStatementHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Do) {
      return DoHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Seq) {
      return CommaHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Object) {
      return ObjectHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_ObjectProperty) {
      return ObjectPropertyHandler.handle.call(this, node, descend);
    }

    if (node instanceof UglifyJS.AST_Array) {
      return ArrayHandler.handle.call(this, node, descend);
    }

    return ;
  }
}

// function(v) {$variableName = v;}
function buildSingleSetter(variableName) {
  var funcBody = new UglifyJS.AST_SimpleStatement({
    body: new UglifyJS.AST_Assign({
      left: new UglifyJS.AST_SymbolRef({name: variableName}),
      right: new UglifyJS.AST_SymbolRef({name: 'v'}),
      operator: '='
    })
  });

  return new UglifyJS.AST_Function({
    argnames: [new UglifyJS.AST_SymbolFunarg({name: "v"})],
    body: [funcBody]
  });
}

// function() { return $variableName;}
function buildSingleGetter(variableName) {
  return new UglifyJS.AST_Function({
    argnames: [],
    body: [
      new UglifyJS.AST_Return({
        value: new UglifyJS.AST_SymbolRef({name: variableName})
      })
    ]
  });
}

function buildExternalVariableAccessors(functionAttributes) {
  var properties = [ ];
  for (var varName in functionAttributes.variables) {
    if (functionAttributes.variables[varName] === 'external') {
      properties.push(
        new UglifyJS.AST_ObjectKeyVal({
          key:    'set_' + varName,
          value:  buildSingleSetter(varName)
        })
      );
      properties.push(
        new UglifyJS.AST_ObjectKeyVal({
          key:    'get_' + varName,
          value:  buildSingleGetter(varName)
        })
      );
    }
  }
  var objToDef = new UglifyJS.AST_Object({properties: properties});


  var varDefinitions = [];
  varDefinitions.push(new UglifyJS.AST_VarDef({
    name: new UglifyJS.AST_SymbolVar({name: "__accessors__"}),
    value: objToDef
  }));
  var varNode = new UglifyJS.AST_Var({
    definitions: varDefinitions
  });

  return varNode;
}

function buildFunctionBody(node, context, functionAttributes) {
  var funcNode = new UglifyJS.AST_Dot({
    expression: new UglifyJS.AST_SymbolRef({name: 'AsyncTool'}),
    property: 'eval'
  });

  var callNode =  new UglifyJS.AST_Call({
    expression: funcNode,
    args: [
      new UglifyJS.AST_SymbolRef({name: '__local_variables__'}),
      new UglifyJS.AST_SymbolRef({name: '__accessors__'}),
      new UglifyJS.AST_Array({elements: Utility.dupArray(node.body)})
    ]
  });

  var returnNode = new UglifyJS.AST_Return({
    value: callNode
  });

  {
    var varDefinitions = [];
    varDefinitions.push(new UglifyJS.AST_VarDef({
      name: new UglifyJS.AST_SymbolVar({name: "__local_variables__"}),
      value: context
    }));
    var varNode = new UglifyJS.AST_Var({
      definitions: varDefinitions
    });
  }

  node.body = [buildExternalVariableAccessors(functionAttributes),  varNode, returnNode];

  return node;
}

module.exports = Transformer;
