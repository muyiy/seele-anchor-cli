const stem = require("seele-stemsdk-javascript")
const {
  getConf,
  getNode
} = require('./conf');

async function accountInfo(acc){
  return new Promise(async function(resolve, reject) {
    var list = require('./conf').list
    // console.log(list);
    var pro = list(null, null)
    // var shard = seele.key.shard(acc)
    // var node = await getNode(pro, shard);
    var conf = await getConf(pro)
    var rpc = new stem.rpc(conf.subchain.node)
    Promise
    .all([
      rpc.getAccountNonce(acc,"",-1),
      rpc.getBalance(acc,"",-1),
    ])
    .then((d)=>{
      // console.log(d);
      resolve({
        Nonce: d[0],
        Balance: d[1].Balance
      })
    })

  });
}


module.exports = {
  accountInfo: accountInfo
}
