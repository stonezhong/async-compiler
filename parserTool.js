var UglifyJS = require('uglify-js');

var ROOT_NODE_TYPE = {
  v: UglifyJS.AST_Node,
  children: [
    {
      v: UglifyJS.AST_Statement,
      children: [
        { v: UglifyJS.AST_Debugger },
        { v: UglifyJS.AST_Directive },
        { v: UglifyJS.AST_SimpleStatement },
        {
          v: UglifyJS.AST_Block,
          children: [
            { v: UglifyJS.AST_BlockStatement },
            {
              v: UglifyJS.AST_Scope,
              children: [
                { v: UglifyJS.AST_Toplevel },
                {
                  v: UglifyJS.AST_Lambda,
                  children: [
                    { v: UglifyJS.AST_Accessor },
                    { v: UglifyJS.AST_Function },
                    { v: UglifyJS.AST_Defun },
                  ]
                },
              ]
            },
            { v: UglifyJS.AST_Switch },
            {
              v: UglifyJS.AST_SwitchBranch,
              children: [
                { v: UglifyJS.AST_Default },
                { v: UglifyJS.AST_Case },
              ]
            },
            { v: UglifyJS.AST_Try },
            { v: UglifyJS.AST_Catch },
            { v: UglifyJS.AST_Finally },
          ]
        },
        { v: UglifyJS.AST_EmptyStatement },
        {
          v: UglifyJS.AST_StatementWithBody,
          children: [
            { v: UglifyJS.AST_LabeledStatement },
            {
              v: UglifyJS.AST_IterationStatement,
              children: [
                {
                  v: UglifyJS.AST_DWLoop,
                  children: [
                    { v: UglifyJS.AST_Do },
                    { v: UglifyJS.AST_While },
                  ]
                },
                { v: UglifyJS.AST_For },
                { v: UglifyJS.AST_ForIn },
              ]
            },
            { v: UglifyJS.AST_With },
            { v: UglifyJS.AST_If },
          ]
        },
        {
          v: UglifyJS.AST_Jump,
          children: [
            {
              v: UglifyJS.AST_Exit,
              children: [
                { v: UglifyJS.AST_Return },
                { v: UglifyJS.AST_Throw },
              ]
            },
            {
              v: UglifyJS.AST_LoopControl,
              children: [
                { v: UglifyJS.AST_Break },
                { v: UglifyJS.AST_Continue }
              ]
            }
          ]
        },
        {
          v: UglifyJS.AST_Definitions,
          children: [
            { v: UglifyJS.AST_Var },
            { v: UglifyJS.AST_Const },
          ]
        },
      ]
    },
    { v: UglifyJS.AST_VarDef },
    {
      v: UglifyJS.AST_Call,
      children: [
        { v: UglifyJS.AST_New },
      ]
    },
    { v: UglifyJS.AST_Seq },
    {
      v: UglifyJS.AST_PropAccess,
      children: [
        { v: UglifyJS.AST_Dot },
        { v: UglifyJS.AST_Sub },
      ]
    },
    {
      v: UglifyJS.AST_Unary,
      children: [
        { v: UglifyJS.AST_UnaryPrefix },
        { v: UglifyJS.AST_UnaryPostfix },
      ]
    },
    {
      v: UglifyJS.AST_Binary,
      children: [
        { v: UglifyJS.AST_Assign },
      ]
    },
    { v: UglifyJS.AST_Conditional },
    { v: UglifyJS.AST_Array },
    { v: UglifyJS.AST_Object },
    {
      v: UglifyJS.AST_ObjectProperty,
      children: [
        { v: UglifyJS.AST_ObjectKeyVal },
        { v: UglifyJS.AST_ObjectSetter },
        { v: UglifyJS.AST_ObjectGetter },
      ]
    },
    {
      v: UglifyJS.AST_Symbol,
      children: [
        { v: UglifyJS.AST_SymbolAccessor },
        {
          v: UglifyJS.AST_SymbolDeclaration,
          children: [
            {
              v: UglifyJS.AST_SymbolVar ,
              children: [
                { v: UglifyJS.AST_SymbolFunarg },
              ]
            },
            { v: UglifyJS.AST_SymbolConst },
            { v: UglifyJS.AST_SymbolDefun },
            { v: UglifyJS.AST_SymbolLambda },
            { v: UglifyJS.AST_SymbolCatch },
          ]
        },
        { v: UglifyJS.AST_Label },
        { v: UglifyJS.AST_SymbolRef },
        { v: UglifyJS.AST_LabelRef },
        { v: UglifyJS.AST_This },
      ]
    },
    {
      v: UglifyJS.AST_Constant,
      children: [
        { v: UglifyJS.AST_String },
        { v: UglifyJS.AST_Number },
        { v: UglifyJS.AST_RegExp },
        {
          v: UglifyJS.AST_Atom,
          children: [
            { v: UglifyJS.AST_Null },
            { v: UglifyJS.AST_NaN },
            { v: UglifyJS.AST_Undefined },
            { v: UglifyJS.AST_Hole },
            { v: UglifyJS.AST_Infinity },
            {
              v: UglifyJS.AST_Boolean,
              children: [
                { v: UglifyJS.AST_True },
                { v: UglifyJS.AST_False },
              ]
            },
          ]
        },
      ]
    },
  ]
};


var ParserTool = {
  findNodeType: function(node) {
    if (!(node instanceof ROOT_NODE_TYPE.v)) {
      return "Unknown";
    }
    var nodeType = ROOT_NODE_TYPE;
    for (;;) {
      if (!("children" in nodeType)) {
        break;
      }
      var tmpNodeType = null;
      for (var i = 0; i < nodeType.children.length; i ++) {
        if (node instanceof nodeType.children[i].v) {
          tmpNodeType = nodeType.children[i];
          break;
        }
      }
      if (tmpNodeType === null) {
        break;
      }
      nodeType = tmpNodeType;
    }

    return nodeType.v.name;
  }

};

module.exports = ParserTool;
