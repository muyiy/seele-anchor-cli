const {getConf, getNode, setConf, getAbi} = require('./conf')
const seele = require('seele-sdk-javascript');
const stem = require('seele-stemsdk-javascript');
const term = require( 'terminal-kit' ).terminal;

/**
 * fillhashes - fill constructor
 *
 * @param  {type} pro description
 * @returns {type}     description
 */
async function fillhashes(pro){
  var conf = await getConf(pro)
  const node = await getNode(pro)
  const rpc = new seele.rpc(node)
  const opadr = conf.constructors['StemRootchain.sol'][1][4]
  const opbal = conf.constructors['StemRootchain.sol'][1][5]
  var result = await rpc.subGen(opadr.join(','), opbal.join(','))
  // console.log(result);
  conf.constructors['StemRootchain.sol'][1][1] = [
    result.balanceTreeRoot,
    result.txTreeRoot
  ]
  await setConf(pro, conf);
}

/**
 * request - description
 *
 * @param  {string} root      path
 * @param  {string} pro      path
 * @param  {object} argv   amount
 * @returns {type}          description
 */
async function stemrequest(root, pro, argv){
  const dep = argv.d
  const abi = await getAbi(root);
  const stm = new seele.contract(null, abi);
  const conf = await getConf(pro)
  const node = await getNode(pro)
  const rpc = new seele.rpc(node)
  const from = conf.transactions.fromAddress
  const to = conf.addressBook["StemRootchain.sol"]
  const initTx = seele.signature.initTxn(from, to, 0)
  initTx.AccountNonce = await rpc.getAccountNonce(from, "", -1)


  const account = conf.subchain.self.address
  const amount = argv.amount
  var result

  if ( argv._.includes('out') && amount > 0 ) {
    // result = stm.removeExitRequest()
    argv.o ? result = stm.operatorExitRequest(account) : result = stm.userExitRequest(account, amount)
  } else if ( argv._.includes('out') && amount == 0 ) {
    // result = stm.execOperatorExit()
    // result = stm.execUserExit()
  } else if ( argv._.includes('in') ) {
    // result = stm.removeDepositRequest()
    argv.o ? result = stm.addOperatorRequest(account, from) : result = stm.userDepositRequest(account, from)
    initTx.Amount = amount
  } else if ( argv._.includes('fee') ) {
    result = stm.feeExit(account, amount)
  } else {
    const stm = new stem.rpc(conf.subchain.node)
    const slebal = await rpc.getBalance(from, "", -1)
    const nonce = await rpc.getAccountNonce(from, "", -1)
    // const bt = await stm.getDepositAccounts()
    // const dp = await rpc.call(to, bt.byteCode, -1)
    const stmbal = 0
    // const stmbal = await stm.getBalance(account, "", -1)
    console.log({
      sle:{
        Balance: slebal.Balance,
        Account: slebal.Account,
        Nonce: nonce
      },
      stm:{
        Balance:stmbal
      }
    });
    return "no transaction"
  }

  initTx.Payload = result.byteCode
  const gas = await rpc.estimateGas({Data: initTx})
  initTx.GasLimit = gas
  console.log(initTx);
  // initTx.GasLimit = 1000000
  const pri = conf.transactions.privateKey
  argv.n != undefined ? initTx.AccountNonce = argv.n : console.log();
  const signTx = seele.signature.signTxn(pri, initTx)
  console.log(signTx);
  const txresult = await mustsend(signTx, node, dep)
  console.log(txresult);
}

/**
 * adtx - transaction across mainnet
 *
 * @param  {type} pro  description
 * @param  {type} argv description
 * @returns {type}      description
 */
async function adtx(pro, argv){
  const conf = await getConf(pro);
  const node = await getNode(pro);
  const rpc = new seele.rpc(node);
  var pri, to, result
  argv.f!=undefined? pri = argv.f: pri = conf.transactions.privateKey;
  const from = seele.key.addof(pri);
  argv.t!=undefined? to = argv.t: to = from;
  var initTx = seele.signature.initTxn(from, to, argv.a);
  initTx.Payload = argv.p;
  initTx.AccountNonce = await rpc.getAccountNonce(from, "", -1);
  const gas = await rpc.estimateGas({Data: initTx});
  initTx.GasPrice = argv.g;
  initTx.GasLimit = argv.l;
  initTx.Timestamp = argv.i;
  argv.n!=undefined? initTx.AccountNonce = argv.n:initTx.AccountNonce;
  const signTx = seele.signature.signTxn(pri, initTx);

  console.log(signTx);
  argv.s? result: result = await mustsend(signTx, node, argv.d);
}

/**
 * freeze - freeze subchain
 *
 * @param  {type} root description
 * @param  {type} pro  description
 * @returns {type}      description
 */
async function freeze(root, pro){
  const cnf = await getConf(pro);
  const adr = cnf.addressBook['StemRootchain.sol'];
  const abi = await getAbi(root);
  const stm = new seele.contract(null, abi);
  const ipp = await getNode(pro);
  const rpc = new seele.rpc(ipp);
  const own = await rpc.call(adr, stm.getOwner().byteCode, -1);

  const pri = cnf.transactions.privateKey
  const pub = seele.key.addof(pri)
  var initTx = seele.signature.initTxn(pub, adr, 0);
  initTx.GasLimit = cnf.transactions.limit;
  initTx.AccountNonce = await rpc.getAccountNonce(pub, "", -1);

  // getLastConfirmedChildBlockNumber [] TODO
  // getChildBlockTimestamp [blocknum]
  // getRelayTimeout //TODO
  // now - timestamp > getRelayTimeout


  if ( pub == own ) {
    initTx.Payload = stm.discard().byteCode;
    var signTx = seele.signature.signTxn(pri, initTx);
    var result = await mustsend(signTx, ipp, cnf.transactions.depth);
  } else if ( true ) {
    initTx.Payload = stm.timeOutDiscard().byteCode;
    var signTx = seele.signature.signTxn(pri, initTx);
    var result = await mustsend(signTx, ipp, cnf.transactions.depth);
  } else {
    term.red('Not freezable')
  }

}

/**
 * challenge - description
 *
 * @param  {type} root description
 * @param  {type} pro  description
 * @returns {type}      description
 */
async function challenge(root, pro){
  const cnf = await getConf(pro);
  var stemip = cnf.subchain.node;
  var seeleip = await getNode(pro);
  var stmrpc = new stem.rpc(stemip);
  var slerpc = new seele.rpc(seeleip);

  const abi = await getAbi(root);
  const stm = new seele.contract(null, abi);
  const pri = cnf.transactions.privateKey
  const pub = seele.key.addof(pri)
  var initTx = seele.signature.initTxn(pub, adr, 0);
  initTx.GasLimit = cnf.transactions.limit;
  initTx.AccountNonce = await rpc.getAccountNonce(pub, "", -1);
  // initTx.Payload = stm.challengeSubmittedBlock(...).byteCode
  var signTx = seele.signature.signTxn(pri, initTx);
  var result = await mustsend(signTx, ipp, cnf.transactions.depth);
}

/**
 * keep - requirements
 * balance.length = acccount.length
 * subchain not frozen
 * last block confirmed
 * valid block number
 * fee*|operators| < total deposit
 * the accounts must already exist in the contract
 * payable amount = self.blockSubmissionBond from StemCreation.sol
 * @returns {type}  description
 */
async function keep(root, pro){
  // 1. Relay block
  // 2. Get transactions
  // 3. Send transaction
  // get contract
  const abi = await getAbi(root);
  const stm = new seele.contract(null, abi);
  var action, shouldReverse, shouldSubmit

  // get the nodes
  const cnf = await getConf(pro);
  const adr = cnf.addressBook['StemRootchain.sol'];
  var stemip = cnf.subchain.node;
  var seeleip = await getNode(pro);
  var stmrpc = new stem.rpc(stemip);
  var slerpc = new seele.rpc(seeleip);

  // var heightCall = stm.getLastConfirmedChildBlockNumber()

  // var d = await Promise.all([
  //   slerpc.call(adr, heightCall.byteCode, -1),
  //   stmrpc.getBalanceTreeRoot(),
  //   stmrpc.getTransactionTreeRoot(),
  //   stmrpc.getUpdateAccounts(),
  //   stmrpc.getUpdateBalances(),
  //   stmrcp.getFee()
  // ])
  //
  // {
  //   "subchain": {
  //     "address": "0xDA856cA3DDB8C791A153bf1e25C6Bda4f1e45eE5",
  //     "private": "0xc025e4378d54da29a196246ee9e91576460065f4b0fd04a0d9707dfe801fe029"
  //   },
  //   "mainchain": {
  //     "shard": 1,
  //     "address": "0x6bc038c1dd610cdca463d5b1a8b6e553597ec001",
  //     "private": "0x63932f6d4cf2d8f5e501d429d38530781d842e48851e987ce8adba7322c4116d"
  //   }
  // }
  // {
  //   "subchain": {
  //     "address": "0x29f5F41A70e9CB52aA6B40beDFDc05dCe1E02196",
  //     "private": "0xbc8814611ff0986a37f138328f0df9c8c5d470ea7d1eb80fc47480c73e9935c0"
  //   },
  //   "mainchain": {
  //     "shard": 1,
  //     "address": "0x17af21a7c95f6b5b89a3101b9c84d87dd5496b21",
  //     "private": "0x62c213e65ca8eb5105f553aeca10e5fddaf5c9f146c36df52ff8fc68aa068be2"
  //   }
  // }

  var height = 1000
  var balroot = "0x0000000000000000000000000000000000000000000000000000000000000002"
  var txnroot = "0x0000000000000000000000000000000000000000000000000000000000000001"
  var accounts = [
    "0x84DB7AACDC9019F211AF45554d59681C90DCe904",
    "0xdF855B0343CE1120c902C3298A4a7096B901F206"
  ]
  var balances = [
    150,
    140
  ]
  var fee = 5

  const code = stm.submitBlock(height, balroot, txnroot, accounts, balances, fee)
  const result = await employ(pro,1,code.byteCode);
  console.log(result);

  // if ( shouldReverse ) {
  //   // action = stm.reverseBlock() //[blkNum]
  // } else if ( shouldSubmit ) {
  //   // action = stm.submitBlock() //[...]
  // } else {
  //
  // }

}

/**
 * employ - general employ function
 *
 * @param  {type} pro     description
 * @param  {type} amount  description
 * @param  {type} payload description
 * @returns {type}         description
 */
async function employ(pro, amount, payload){
  return new Promise(async function(resolve, reject) {
    try {
      const cnf = await getConf(pro);
      const pri = cnf.transactions.privateKey
      const pub = seele.key.addof(pri)
      const adr = cnf.addressBook['StemRootchain.sol'];

      const seeleip = await getNode(pro);
      const rpc = new seele.rpc(seeleip);
      var initTx = seele.signature.initTxn(pub, adr, amount);
      initTx.GasLimit = cnf.transactions.limit;
      initTx.AccountNonce = await rpc.getAccountNonce(pub, "", -1);
      initTx.Payload = payload
      const signTx = seele.signature.signTxn(pri, initTx);
      console.log(signTx);
      const result = await mustsend(signTx, seeleip, cnf.transactions.depth);
      resolve(result)
    } catch (e) {
      reject(e)
    }
  });
}

/**
 * mustsend - must send
 *
 * @returns {type}  description
 */
async function mustsend(tx, node, depth){
  // checks amount
  const timebeg = Date.now()
  term.clear()
  return new Promise(async function(resolve, reject) {
    try {
      const rpc = new seele.rpc(node);
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
          else { add = add.slice(0, 10)}


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
            clearInterval(done);
          } else if (typeof add == 'object' && JSON.stringify(add).includes('nonce is too small')) {
            clearInterval(done);
          } else {}
        })
      }, 1000);
    } catch ( e ) {
      console.error(e);
      reject(e)
    }

    resolve(true)
  });
}


module.exports = {
  fillHashes: fillhashes,
  stemrequest: stemrequest,
  adtx: adtx,
  keep: keep
}
