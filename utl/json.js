
function quotify(str){
  var quoted = str.replace(/ /g, "")
  .replace(/{/g, "{\"")
  .replace(/}/g, "\"}")
  .replace(/:/g, "\":\"")
  return quoted
}

var v = `{  a : sdf }`
// console.log(quotify(v));
console.log(JSON.parse(quotify(v)));

module.exports = {
  qoutify: quotify
}
