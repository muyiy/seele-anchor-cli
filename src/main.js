const {
  getConf,
  getNode
} = require('./conf');
const seele = require('seele-sdk-javascript')

async function accountInfo(acc){
  return new Promise(async function(resolve, reject) {
    var list = require('./conf').list
    // console.log(list);
    var pro = list(null, null)
    var shard = seele.key.shard(acc)
    var node = await getNode(pro, shard);
    var rpc = new seele.rpc(node)
    Promise
    .all([
      rpc.getAccountNonce(acc,"",-1),
      rpc.getBalance(acc,"",-1),
    ])
    .then((d)=>{
      resolve({
        Nonce: d[0],
        Shard: shard,
        Balance: d[1].Balance
      })
    })

  });
}

module.exports = {
  accountInfo: accountInfo
}
