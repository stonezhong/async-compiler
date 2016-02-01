var UglifyJS = require('uglify-js');

// isAsync: 是否是异步函数
// variables: 变量表，比如 { x: "local", y: "arg", ...}
// preparse:  preparse阶段只是收集局部变量的名字。

class FunctionAttributesManager {
  constructor() {
    this.functionAttributesStack = [
      {isAsync: false}
    ];
  }

  push(functionAttributes) {
    this.functionAttributesStack.push(functionAttributes);
  }

  pop() {
    return this.functionAttributesStack.pop();
  }

  getAttribute(attributeName) {
    return this.getAttributes()[attributeName];
  }

  setAttribute(attributeName, attributeValue) {
    this.getAttributes()[attributeName] = attributeValue;
  }

  getAttributes() {
    return this.functionAttributesStack[this.functionAttributesStack.length - 1];
  }

  getVariables() {
    return this.getAttributes()["variables"];
  }

  setLocalVariable(name) {
    var variables = this.getVariables();
    if (!(name in variables) || (variables[name] === 'external')) {
      variables[name] = 'local';
    }
    return ;
  }

  setArgumentVariable(name) {
    this.getVariables()[name] = 'argument';
  }

  setExternalVariable(name) {
    var variables = this.getVariables();
    if (!(name in variables)) {
      variables[name] = 'external';
    }
    return ;
  }

  getVariableType(name) {
    return this.getVariables()[name];
  }

}

module.exports = FunctionAttributesManager;
