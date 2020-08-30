/*

You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

Example:

Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
Output: 7 -> 0 -> 8
Explanation: 342 + 465 = 807.

*/

function asInt(linked){
  let intString, thisNode = linked;
  while (thisNode){
      intString = `${thisNode.val}${intString||''}`;
      thisNode = thisNode.next;
  }
  return Number(intString);
}
function asLinked(int){
  let chars = [...int.toString()].reverse();
  let thisNode, firstNode;
  chars.forEach(c => {
      const newNode = { val: Number(c) };
      if(!thisNode){
          thisNode = firstNode = newNode;
          return;
      }
      thisNode.next = newNode;
      thisNode = thisNode.next;
  });
  return firstNode;
}
var addTwoNumbers = function(l1, l2) {
  const sum = asInt(l1) + asInt(l2);
  return asLinked(sum);
};