/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2019-02-25
 * fork from https://github.com/systemjs/systemjs/blob/master/src/extras/global.js
 */
var firstGlobalProp, secondGlobalProp, lastGlobalProp;
export function getGlobalProp() {
  var cnt = 0;
  var lastProp;
  var hasIframe = false;

  for (var p in global) {
    if (!global.hasOwnProperty(p)) continue; // 遍历 iframe，检查 window 上的属性值是否是 iframe，是则跳过后面的 first 和 second 判断

    for (var i = 0; i < window.frames.length; i++) {
      var frame = window.frames[i];
      console.log("frame", frame);

      if (frame === global[p]) {
        hasIframe = true;
        break;
      }
    }

    if (!hasIframe && (cnt === 0 && p !== firstGlobalProp || cnt === 1 && p !== secondGlobalProp)) return p;
    cnt++;
    lastProp = p;
  }

  if (lastProp !== lastGlobalProp) return lastProp;
}
export function noteGlobalProps() {
  // alternatively Object.keys(global).pop()
  // but this may be faster (pending benchmarks)
  firstGlobalProp = secondGlobalProp = undefined;
  console.dir(global);
  debugger;

  for (var p in global) {
    if (!global.hasOwnProperty(p)) continue;
    if (!firstGlobalProp) firstGlobalProp = p;else if (!secondGlobalProp) secondGlobalProp = p;
    lastGlobalProp = p;
  }

  console.log("firstGlobalProp", firstGlobalProp);
  console.log("secondGlobalProp", secondGlobalProp);
  return lastGlobalProp;
}
export function getInlineCode(match) {
  var start = match.indexOf('>') + 1;
  var end = match.lastIndexOf('<');
  return match.substring(start, end);
}