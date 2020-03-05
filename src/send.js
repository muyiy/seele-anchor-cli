const stm = require('seele-stemsdk-javascript');
const sle = require('seele-sdk-javascript')

async function send(fromPri, toAddress, amount, operator, node){
  // const fromAd = stm.key.addof(fromPri).address
  const fromAd = sle.key.addof(fromPri)
  const initTx = stm.signature.initTxn(fromAd, toAddress, amount)
  operator ? initTx.Type = 1 : initTx.Type = 0;
  const rpc = new stm.rpc(node)
  // console.log(rpc);

  const nonce = await rpc.getAccountNonce(fromAd,"",-1);
  initTx.AccountNonce = nonce
  // const bal = await rpc.getBalance(fromAd,"",-1);
  // console.log("Bal : ", bal);
  const signTx = stm.signature.signTxn(fromPri, initTx);
  console.log("Hash : ", signTx.Hash);
  const result = await rpc.addTx(signTx);
  console.log(result);
}

module.exports = {
  send: send
}

// const abi = {}
// const sle = require('seele-sdk-javascript');
// const contract = new sle.contract(null, abi);
// const sle = require('seele-sdk-javascript');
// const contractAddress = '' //your contract addresss
// const from = '' //your from address
// const pri = '' //your from privatekey
//
// async function sendscore(){
//   const result = contract.sendScoreMethod(...score);
//   const initTx = sle.signature.initTx(from, contractAddress, amount);
//   initTx.Payload = result.methodInfo.byteCode;
//   initTx.Limit = 60000;
//   initTx.Nonce = await rpc.getAccountNonce(from, '', -1);
//   const signTx = sle.signature.signTx(pri, initTx);
//   await rpc.addTx(signTx);
// }
