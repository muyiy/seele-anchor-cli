const seele = require('seele-sdk-javascript');
const {getAbi, getNode, getConf} = require('./conf')
const Web3 = require('web3')
const web3 = new Web3()


async function allAccounts(root, pro){
  var sub = await contract(root);
  var usl = await call(pro, sub.getUsersLen());
  var opl = await call(pro, sub.getOps());
  var arr = {}
  for ( opr of opl['0'] ) {
    var bal = await call(pro, sub.getOperatorBalance(opr))
    arr[opr] = bal['0']
  }
  console.log(arr);
}

async function contract(root) {
  var abi = await getAbi(root)
  return new seele.contract(null,abi)
}

async function call(pro, info){
  return new Promise(async function(resolve, reject) {
    try {
      var node = await getNode(pro);
      var conf = await getConf(pro);
      var add = conf.addressBook['StemRootchain.sol'];
      var rpc = new seele.rpc(node);
      var msg = await rpc.call(add, info.byteCode, -1);
      var res = [null]
      msg.result!="0x" ? res = web3.eth.abi.decodeParameters(info.methodInfo.outputs, msg.result): res;
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
}

async function status(root, pro){
  var abi = await getAbi(root)
  var subchain = new seele.contract(null,abi)
  // console.log(subchain);
  var statusFuncs= [
    subchain.isFrozen(),
    subchain.getOwner(),
    subchain.getChildChainName(),
    subchain.getContractBalance(),
    subchain.getTotalDeposit(),
    subchain.getCreatorDeposit(),
    subchain.getTotalBalance(),
    subchain.getTotalFee(),
    // subchain.getStaticNodes(),
    subchain.getDepositAccounts()
  ];

  var node = await getNode(pro);
  // console.log(node);
  var rpc = new seele.rpc(node);
  var conf = await getConf(pro);
  // console.log(statusFuncs);
  // rpc.call
  var add = conf.addressBook['StemRootchain.sol'];
  var status = {}
  for ( const i in statusFuncs ) {
    var message = await rpc.call(add, statusFuncs[i].byteCode, -1);
    // console.log(message);
    if ( message.result == "0x" ) {
      var result = [null]
    } else {
      var result = web3.eth.abi.decodeParameters(statusFuncs[i].methodInfo.outputs, message.result);
    }
    // console.log(statusFuncs[i].methodInfo.name, ' : ', result['0']);
    status[statusFuncs[i].methodInfo.name] = result['0']
    // console.log(result);
  }
  if  ( status.getChildChainName != null ) {
    var name = Buffer.from(status.getChildChainName.slice(2), 'hex').toString()
    status.getChildChainName = name.replace(/\0/g, '')
  }
  // console.log(status);
  return status;
}

async function challenge(root, pro){
  var subchain = await contract(root)
  // console.log(subchain);
  var chalFunc= [
    subchain.getChallengeLen(),
    // subchain.getChallengeId(),
    // subchain.getChallengeTarget(),
  ];

  var node = await getNode(pro);
  var rpc = new seele.rpc(node);
  var conf = await getConf(pro);
  // rpc.call
  var add = conf.addressBook['StemRootchain.sol'];
  var chal = {}
  for ( const i in chalFunc ) {
    var message = await rpc.call(add, chalFunc[i].byteCode, -1);
    if (message.result=="0x") {
      var result = [null]
    } else {
      var result = web3.eth.abi.decodeParameters(chalFunc[i].methodInfo.outputs, message.result);
    }
    // console.log(chalFunc[i].methodInfo.name, ' : ', result['0']);
    chal[chalFunc[i].methodInfo.name] = result['0']
    // console.log(result);
  }
  return chal
}

async function relay(root, pro){
  var abi = await getAbi(root)
  var subchain = new seele.contract(null,abi)
  // console.log(subchain);
  var relayFuncs= [
    subchain.isLastChildBlockConfirmed(),
    subchain.getLastChildBlockNum(),
    subchain.getNextChildBlockNum()
    // subchain.getStaticNodes(),
  ];

  var node = await getNode(pro);
  var rpc = new seele.rpc(node);
  var conf = await getConf(pro);
  // rpc.call
  var add = conf.addressBook['StemRootchain.sol'];
  var relay = {}
  for ( const i in relayFuncs ) {
    var message = await rpc.call(add, relayFuncs[i].byteCode, -1);
    if ( message.result == "0x" ) {
      var result = [null]
    } else {
      var result = web3.eth.abi.decodeParameters(relayFuncs[i].methodInfo.outputs, message.result);
    }
    // console.log(relayFuncs[i].methodInfo.name, ' : ', result['0']);
    relay[relayFuncs[i].methodInfo.name] = result['0']
    // console.log(result);
  }

  return relay

}

module.exports = {
  status: status,
  challenge: challenge,
  relay: relay,
  allAccounts: allAccounts
}
