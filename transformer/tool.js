// for a function node, is this an async function?
function isAsyncFunction(node) {
  var comments = node.start.comments_before;
  for (var i = 0; i < comments.length; i ++) {
    var comment = comments[i];
    if (comment.value === '* @async *') {
      return true;
    }
  }
  return false;
}
