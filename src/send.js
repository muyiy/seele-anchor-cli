const stm = require('seele-stemsdk-javascript');
const sle = require('seele-sdk-javascript');
const term = require( 'terminal-kit' ).terminal;
const {getConf, list} = require('./conf');
const {isPrivate} = require('./types');

async function send(arg){
  return new Promise(async function(resolve, reject) {
    try {
      const pro = await list(null,null)
      const conf = await getConf(pro)
      if ( /self|mint|melt|roll/g.test(arg.f)) {
        var priv = conf.subchain[arg.f].private
      } else if ( isPrivate(arg.f) ) {
        var priv = arg.f
      } else {
        return
      }
      const from = sle.key.addof(priv)
      const deep = conf.subchain.depth
      const node = conf.subchain.node
      const stem = new stm.rpc(node)
      const initTx = stm.signature.initTxn(from, arg.t, arg.a)
      initTx.Type = arg.o
      initTx.limit = conf.subchain.limit
      initTx.AccountNonce = await determinenonce(arg.n, from, node)
      const signTx = stm.signature.signTxn(priv, initTx, arg.h)
      console.log(signTx);
      if (arg.stop) {
        resolve(signTx)
        return
      } else {
        const result = await mustsend(signTx, node, deep)
        resolve(signTx)
      }
    } catch (e){
      console.error(e);
      reject(e)
    }
  });
}

async function determinenonce(nonce, from, node){
  if( Number.isInteger(nonce) ){
    return nonce
  } else if ( /^[0-9]*$/g.test(nonce) ) {
    return parseInt(nonce)
  } else {
    return new Promise(async function(resolve, reject) {
      const stem = new stm.rpc(node)
      const nonce = await stem.getAccountNonce(from, "", -1)
      resolve(nonce)
    });
  }
}

async function sendRaw(fromPri, toAddress, amount, operator, node){
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

async function mustsend(tx, node, depth){
  // checks amount
  const timebeg = Date.now()
  term.clear()
  return new Promise(async function(resolve, reject) {
    try {
      const rpc = new stm.rpc(node);
      var done = setInterval(async function() {
        await Promise.all([
          rpc.getInfo(),
          rpc.addTx(tx),
          rpc.getTransactionByHash(tx.Hash),
          rpc.getReceiptByTxHash(tx.Hash, '')
        ])
        .then((d)=>{
          var inf, add, txh, rch
          d[0].error?inf=d[0].error.message:inf=d[0]
          d[1].error?add=d[1].error.message:add=d[1]
          d[2].error?txh=d[2].error.message:txh=d[2]
          d[3].error?rch=d[3].error.message:rch=d[3]

          // console.log(inf.CurrentBlockHeight, inf.BlockAge, inf.PeerCnt, inf.Version);
          // console.log(add);
          // console.log(txh.status);
          // console.log(rch.failed, rch.contract, rch.totalFee, rch.usedGas, rch.result);
          var dep, sta, fal, con, res, tim, timeend=Date.now()
          txh.blockHeight==undefined?dep='_':dep = inf.CurrentBlockHeight - txh.blockHeight;
          txh.status==undefined?sta='_':sta = txh.status
          rch.failed==undefined?fal='_':fal = rch.failed
          rch.contract==undefined?con='_':con = rch.contract
          tim= parseInt((timeend-timebeg)/1000)

          if (add===true) {}
          else if (JSON.stringify(add).includes('exists')) {add='exists'}
          else if (JSON.stringify(add).includes('duplicate')) {add='exists'}
          else if (JSON.stringify(add).includes('nonce is too small')) {add='nonce err'}
          else { add = add.slice(0, 50)}


          term()
          .restoreCursor()
          .saveCursor()
          .eraseLineAfter()
          .green(`time:`).cyan(` ${tim} s`).eraseLineAfter()
          .green(`\nsend:`).cyan(` ${add}`).eraseLineAfter()
          .green(`\ntx depth:`).cyan(` ${dep}/${depth}`).eraseLineAfter()
          .green(`\ntx status:`).cyan(` ${sta}`).eraseLineAfter()
          .green(`\nrc failed:`).cyan(` ${fal}`).eraseLineAfter()
          .green(`\nrc contract:`).cyan(` ${con}\n`).eraseLineAfter()

          if (txh.status=='block' && dep!='_' && dep >= depth) {
            resolve('block')
            clearInterval(done);
          } else if (typeof add == 'object' && JSON.stringify(add).includes('nonce is too small')) {
            resolve('nonce too small')
            clearInterval(done);
          } else {}
        })
      }, 1000);
    } catch ( e ) {
      console.error(e);
      reject(e)
    }
  });
}

module.exports = {
  send: send
}
