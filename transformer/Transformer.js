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
var ConditionalHandler = require('../handler/ConditionalHandler');
var ThrowHandler = require('../handler/ThrowHandler');
var TryHandler = require('../handler/TryHandler');
var CatchHandler = require('../handler/CatchHandler');
var FinallyHandler = require('../handler/FinallyHandler');
var ForInHandler = require('../handler/ForInHandler');
var SwitchHandler = require('../handler/SwitchHandler');
var CaseHandler = require('../handler/CaseHandler');
var ThisHandler = require('../handler/ThisHandler');

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
    if (typeof(node.start) === 'undefined') {
      return false;
    }
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

    if (transformer.fam.getAttribute("isPrePass")) {
      if ((node instanceof UglifyJS.AST_Defun) || (node instanceof UglifyJS.AST_Function)) {
        // do nothing
      } else {
        descend(node, this);
      }
      if (node instanceof UglifyJS.AST_SymbolRef) {
        transformer.fam.setExternalVariable(node.name);
      } else if ((node instanceof UglifyJS.AST_Var) || (node instanceof UglifyJS.AST_Const)) {
        for (var i = 0; i < node.definitions.length; i ++) {
          var definition = node.definitions[i];
          transformer.fam.setLocalVariable(definition.name.name);
        }
      } else if (node instanceof UglifyJS.AST_This) {
        transformer.fam.setAttribute('isThisAccessed', true);
      }
      return node;
    }

    // 处理一个函数定义
    if ((node instanceof UglifyJS.AST_Defun) ||
        (node instanceof UglifyJS.AST_Function)) {

      // 非异步函数
      if (!transformer.isAsyncFunction(node)) {
        transformer.fam.push({isAsync: false});
        descend(node, this);
        transformer.fam.pop();
        if (transformer.fam.getAttribute("isAsync")) {
          return HandlerTool.buildNode(
            'ref',
            {
              literal: node,
              refType: new UglifyJS.AST_String({value: 'literal'})
            }
          );
        }
        return node;
      }

      transformer.fam.push({ isAsync: true, variables: {}, isPrePass: true });
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

      setUniqueVariableForThis(functionAttributes);
      return buildFunctionBody(node, functionAttributes);
    }

    if (!transformer.fam.getAttribute("isAsync")) {
      // not a function node and we are not inside a async function, bypass
      descend(node, this);
      return node;
    }

    var handler = getHandler(node);
    if (typeof(handler) !== 'undefined') {
      return handler.handle.call(this, node, descend);
    }

    // for anything we don't understand, pass it through
    // console.log(ParserTool.findNodeType(node));
    descend(node, this);
    return node;
  }
}

function setUniqueVariableForThis(functionAttributes) {
  if (functionAttributes.isThisAccessed) {
    for (var i = 0; ; i ++) {
      var variableName = 'this' + i;
      if (!(variableName in functionAttributes.variables)) {
        functionAttributes.fakeThisVariableName = variableName;
        return ;
      }
    }
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

function buildVarDefForLocalVariables(functionAttributes) {
  var varDefs = [];
  for (var variable in functionAttributes.variables) {
    if (functionAttributes.variables[variable] !== 'local') {
      continue;
    }
    varDefs.push(new UglifyJS.AST_VarDef({
      name: new UglifyJS.AST_SymbolVar({name: variable}),
    }));
  }
  if (functionAttributes.isThisAccessed) {
    varDefs.push(new UglifyJS.AST_VarDef({
      name: new UglifyJS.AST_SymbolVar({name: functionAttributes.fakeThisVariableName}),
      value: new UglifyJS.AST_This({name: 'this'}),
    }));
  }
  if (varDefs.length === 0) {
    return new UglifyJS.AST_EmptyStatement();
  }
  return new UglifyJS.AST_Var({definitions: varDefs});
}

function buildVariableAccessors(functionAttributes) {
  var properties = [ ];
  for (var variable in functionAttributes.variables) {
    properties.push(
      new UglifyJS.AST_ObjectKeyVal({
        key:    'set_' + variable,
        value:  buildSingleSetter(variable)
      })
    );
    properties.push(
      new UglifyJS.AST_ObjectKeyVal({
        key:    'get_' + variable,
        value:  buildSingleGetter(variable)
      })
    );
  }
  if (functionAttributes.isThisAccessed) {
    properties.push(
      new UglifyJS.AST_ObjectKeyVal({
        key:    'set_this',
        value:  buildSingleSetter(functionAttributes.fakeThisVariableName)
      })
    );
    properties.push(
      new UglifyJS.AST_ObjectKeyVal({
        key:    'get_this',
        value:  buildSingleGetter(functionAttributes.fakeThisVariableName)
      })
    );
  }

  return new UglifyJS.AST_Object({properties: properties});
}

function buildAsyncContext(functionAttributes) {
  var properties = [ ];
  properties.push(
    new UglifyJS.AST_ObjectKeyVal({
      key:    'accessors',
      value:  buildVariableAccessors(functionAttributes)
    })
  );

  var objToDef = new UglifyJS.AST_Object({properties: properties});

  var varDefinitions = [];
  varDefinitions.push(new UglifyJS.AST_VarDef({
    name: new UglifyJS.AST_SymbolVar({name: "__async_context__"}),
    value: objToDef
  }));
  var varNode = new UglifyJS.AST_Var({
    definitions: varDefinitions
  });

  return varNode;
}

function buildFunctionBody(node, functionAttributes) {
  var funcNode = new UglifyJS.AST_Dot({
    expression: new UglifyJS.AST_SymbolRef({name: 'AsyncTool'}),
    property: 'eval'
  });

  var callNode =  new UglifyJS.AST_Call({
    expression: funcNode,
    args: [
      new UglifyJS.AST_SymbolRef({name: '__async_context__'}),
      new UglifyJS.AST_Array({elements: Utility.dupArray(node.body)})
    ]
  });

  var returnNode = new UglifyJS.AST_Return({
    value: callNode
  });

  node.body = [
    buildVarDefForLocalVariables(functionAttributes),
    buildAsyncContext(functionAttributes),
    returnNode
  ];

  return node;
}

function getHandler(node) {
  if (node instanceof UglifyJS.AST_SimpleStatement) {
    return SimpleStatementHandler;
  }
  if (node instanceof UglifyJS.AST_Binary) {
    return BinaryHandler;
  }
  if (node instanceof UglifyJS.AST_Call) {
    if (node instanceof UglifyJS.AST_New) {
      return NewHandler;
    }
    return CallHandler;
  }
  if (node instanceof UglifyJS.AST_String) {
    return StringHandler;
  }
  if (node instanceof UglifyJS.AST_Number) {
    return NumberHandler;
  }
  if (node instanceof UglifyJS.AST_SymbolRef) {
    return SymbolRefHandler;
  }
  if (node instanceof UglifyJS.AST_Return) {
    return ReturnHandler;
  }
  if (node instanceof UglifyJS.AST_Var) {
    return VarHandler;
  }
  if (node instanceof UglifyJS.AST_Const) {
    return VarHandler;
  }
  if (node instanceof UglifyJS.AST_Dot) {
    return DotHandler;
  }
  if (node instanceof UglifyJS.AST_Sub) {
    return SubHandler;
  }
  if (node instanceof UglifyJS.AST_Atom) {
    return AtomHandler;
  }
  if (node instanceof UglifyJS.AST_RegExp) {
    return AtomHandler;
  }
  if (node instanceof UglifyJS.AST_If) {
    return IfHandler;
  }
  if (node instanceof UglifyJS.AST_BlockStatement) {
    return BlockHandler;
  }
  if (node instanceof UglifyJS.AST_EmptyStatement) {
    return EmptyStatementHandler;
  }
  if (node instanceof UglifyJS.AST_For) {
    return ForHandler;
  }
  if (node instanceof UglifyJS.AST_UnaryPostfix) {
    return PostUnaryHandler;
  }
  if (node instanceof UglifyJS.AST_UnaryPrefix) {
    return PreUnaryHandler;
  }
  if (node instanceof UglifyJS.AST_While) {
    return WhileHandler;
  }
  if (node instanceof UglifyJS.AST_Continue) {
    return ContinueStatementHandler;
  }
  if (node instanceof UglifyJS.AST_Break) {
    return BreakStatementHandler;
  }
  if (node instanceof UglifyJS.AST_Do) {
    return DoHandler;
  }
  if (node instanceof UglifyJS.AST_Seq) {
    return CommaHandler;
  }
  if (node instanceof UglifyJS.AST_Object) {
    return ObjectHandler;
  }
  if (node instanceof UglifyJS.AST_ObjectProperty) {
    return ObjectPropertyHandler;
  }
  if (node instanceof UglifyJS.AST_Array) {
    return ArrayHandler;
  }
  if (node instanceof UglifyJS.AST_Conditional) {
    return ConditionalHandler;
  }
  if (node instanceof UglifyJS.AST_Throw) {
    return ThrowHandler;
  }
  if (node instanceof UglifyJS.AST_Try) {
    return TryHandler;
  }
  if (node instanceof UglifyJS.AST_Catch) {
    return CatchHandler;
  }
  if (node instanceof UglifyJS.AST_Finally) {
    return FinallyHandler;
  }
  if (node instanceof UglifyJS.AST_ForIn) {
    return ForInHandler;
  }
  if (node instanceof UglifyJS.AST_Switch) {
    return SwitchHandler;
  }
  if (node instanceof UglifyJS.AST_SwitchBranch) {
    return CaseHandler;
  }
  if (node instanceof UglifyJS.AST_This) {
    return ThisHandler;
  }
}

module.exports = Transformer;
var HandlerTool = require('../handler/HandlerTool');
