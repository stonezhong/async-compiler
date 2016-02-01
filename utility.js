// some common utilities

var Utility = {

  // shallow dup array
  dupArray: function(src) {
    var newArray = new Array(src.length);
    for (var i = 0; i < src.length; i ++) {
      newArray[i] = src[i];
    }
    return newArray;
  }

};

module.exports = Utility;
