const {
  getConf,
  getNode,
  setConf,
  getAbi
} = require('./conf')
const call = require('./call')
const seele = require('seele-sdk-javascript');
const stem = require('seele-stemsdk-javascript');
const term = require('terminal-kit').terminal;
const {
  send
} = require('./send')
const RLP = require("rlp")

/**
 * fillhashes - fill constructor
 *
 * @param  {type} pro description
 * @returns {type}     description
 */
async function fillhashes() {
  const {
    getConf,
    list,
    setConf
  } = require('./conf')
  const stem = require('seele-stemsdk-javascript');
  var pro = await list()
  var conf = await getConf(pro)

  const rpc = new stem.rpc(conf.subchain.node)
  const opadr = conf.constructors['StemRootchain.sol'][1][4]
  const opbal = conf.constructors['StemRootchain.sol'][1][5]

  Promise.all([
      rpc.getTxTreeRoot(0),
      rpc.getBalanceTreeRoot(0)
    ])
    .then(async (result) => {
      if (result[0].error == undefined && result[1].error == undefined) {
        conf.constructors['StemRootchain.sol'][1][1] = result
        await setConf(pro, conf);
      } else {
        console.error(result[0].error);
        console.error(result[1].error);
      }
    })
}

/**
 * request - description
 *
 * @param  {string} root      path
 * @param  {string} pro      path
 * @param  {object} argv   amount
 * @returns {type}          description
 */
async function stemrequest(root, pro, argv) {
  return new Promise(async function(resolve, reject) {
    try {
      const {
        getConf,
        getNode,
        setConf,
        getAbi
      } = require('./conf')
      const seele = require('seele-sdk-javascript');
      const abi = await getAbi(root);
      const stm = new seele.contract(null, abi);
      const conf = await getConf(pro)
      const node = await getNode(pro)
      const rpc = new seele.rpc(node)
      var dep
      argv.d != null ? dep = argv.d : dep = conf.transactions.depth;
      var pri = conf.transactions.privateKey
      var from = conf.transactions.fromAddress
      var account = conf.subchain.self.address
      if (argv.p != undefined && argv.subaddress != undefined) {
        pri = argv.p
        from = seele.key.addof(pri)
        account = argv.subaddress
      }
      console.log(from);
      const to = conf.addressBook["StemRootchain.sol"]
      const initTx = seele.signature.initTxn(from, to, 0)
      initTx.AccountNonce = await rpc.getAccountNonce(from, "", -1)
      initTx.AccountNonce == 0 ? initTx.AccountNonce = 1 : initTx.AccountNonce = initTx.AccountNonce;

      const amount = argv.amount
      var result

      if (argv._.includes('out')) {
        // result = stm.removeExitRequest()
        if (argv.o) {
          result = stm.operatorExitRequest(account)
          initTx.Amount = 0
        } else {
          result = stm.userExitRequest(account, amount)
          init.Amount = 1;
        }
        // result = stm.execOperatorExit()
        // result = stm.execUserExit()
      } else if (argv._.includes('in')) {
        // result = stm.removeDepositRequest()
        if (argv.o) {
          result = stm.addOperatorRequest(account, from)
        } else {
          result = stm.userDepositRequest(account, from)
        }
        initTx.Amount = amount
      } else if (argv._.includes('fee')) {
        result = stm.feeExit(account, amount)
      } else {
        argv.address != undefined ? from = argv.address : from = from;
        const stm = new stem.rpc(conf.subchain.node)
        const slebal = await rpc.getBalance(from, "", -1)
        const nonce = await rpc.getAccountNonce(from, "", -1)
        // const bt = await stm.getDepositAccounts()
        // const dp = await rpc.call(to, bt.byteCode, -1)
        const stmbal = 0
        // const stmbal = await stm.getBalance(account, "", -1)
        console.log({
          sle: {
            Balance: slebal.Balance,
            Account: slebal.Account,
            Nonce: nonce
          },
          stm: {
            Balance: stmbal
          }
        });
        return "no transaction"
      }

      initTx.Payload = result.byteCode
      const gas = await rpc.estimateGas({
        Data: initTx
      })
      // initTx.GasLimit = gas
      // console.log(initTx);
      initTx.GasLimit = 6000000

      argv.n != undefined ? initTx.AccountNonce = argv.n : console.log();
      const signTx = seele.signature.signTxn(pri, initTx)
      console.log(signTx);
      mustsend(signTx, node, dep)
        .then((d) => {
          resolve(d)
        })
        .catch((e) => {
          reject(e)
        })
    } catch (e) {
      reject(e)
    }

  });
}

/**
 * adtx - transaction across mainnet
 *
 * @param  {type} pro  description
 * @param  {type} argv description
 * @returns {type}      description
 */
async function adtx(argv) {
  return new Promise(async function(resolve, reject) {
    try {
      const {
        getConf,
        getNode,
        setConf,
        getAbi,
        list
      } = require('./conf')
      const seele = require('seele-sdk-javascript');
      const term = require('terminal-kit').terminal;
      const focus = await list()
      const conf = await getConf(focus);
      const node = await getNode(focus);
      const rpc = new seele.rpc(node);
      var pri, to, result
      argv.f != undefined ? pri = argv.f : pri = conf.transactions.privateKey;
      const from = seele.key.addof(pri);
      argv.t != undefined ? to = argv.t : to = from;
      var initTx = seele.signature.initTxn(from, to, argv.a);
      initTx.Payload = argv.p;
      initTx.AccountNonce = await rpc.getAccountNonce(from, "", -1);
      const gas = await rpc.estimateGas({
        Data: initTx
      });
      initTx.GasPrice = argv.g;
      initTx.GasLimit = argv.l;
      initTx.Timestamp = argv.i;
      argv.n != undefined ? initTx.AccountNonce = argv.n : initTx.AccountNonce;
      const signTx = seele.signature.signTxn(pri, initTx);

      console.log(signTx);
      argv.s ? result : result = await mustsend(signTx, node, argv.d);
      console.log("adtx result:", result);
      resolve(result)
    } catch (e) {
      reject(e)
    }
  });
}

/**
 * freeze - freeze subchain
 *
 * @param  {type} root description
 * @param  {type} pro  description
 * @returns {type}      description
 */
async function freeze(root, pro) {
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


  if (pub == own) {
    initTx.Payload = stm.discard().byteCode;
    var signTx = seele.signature.signTxn(pri, initTx);
    var result = await mustsend(signTx, ipp, cnf.transactions.depth);
  } else if (true) {
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
async function challenge(root, pro) {
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
async function keep(root) {
  // 1. Relay block
  // 2. Get transactions
  // 3. Send transaction
  // 4. Remove exit and deposit requests
  // get contract
  const {
    getConf,
    getNode,
    setConf,
    getAbi,
    list
  } = require('./conf')
  const pro = await list(null, null)
  const abi = await getAbi(root);
  const stm = new seele.contract(null, abi);
  var action, shouldReverse, shouldSubmit

  // get rpcs
  const cnf = await getConf(pro);
  const adr = cnf.addressBook['StemRootchain.sol'];
  var stemip = cnf.subchain.node;
  var seeleip = await getNode(pro);
  var stmrpc = new stem.rpc(stemip);
  var slerpc = new seele.rpc(seeleip);

  // get heights
  var info = await stmrpc.getInfo()
  var rlay = await call.relay(root, pro)
  var last = Number.parseInt(rlay.getLastChildBlockNum)
  var next = Number.parseInt(rlay.getNextChildBlockNum)
  var curr = Number.parseInt(info.CurrentBlockHeight)
  // console.log(last, curr, next);
  var diff = 10

  if (last == 0 && curr <= next) {

    // Download & Send
    const initOps = await call.allAccounts(root, pro)
    if ( initOps.error == undefined ) {
      const ops = Object.keys(initOps)
      for (var op of ops) {
        const argv = {
          t: op,
          a: Number.parseInt(initOps[op]),
          o: 0,
          h: diff + last,
          f: 'mint',
          stop: false
        }
        console.log("deposit for operator: ", op);
        await send(argv, pro)
      }
    }
    const stat = await call.status(root, pro)
    if ( stat.error == undefined ) {
      const argv = {
        t: stat["getOwner"],
        a: Number.parseInt(stat["getCreatorDeposit"]),
        o: 0,
        h: diff + last,
        f: 'mint',
        stop: false
      }
      console.log("deposit for owner: ", stat["getOwner"]);
      await send(argv, pro)
    }

  } else if (curr >= next) {

    // Collet & Upload
    var d = await Promise.all([
      stmrpc.getBalanceTreeRoot(next),
      stmrpc.getTxTreeRoot(next),
      stmrpc.getUpdatedAccountInfo(next),
      stmrpc.getFee(next)
    ])
    if (d[0].error == undefined &&
      d[1].error == undefined &&
      d[2].error == undefined &&
      d[3].error == undefined) {
      var balances = RLP.decode(Buffer.from(d[2]["balances"], "base64")).map((buf) => {
        return parseInt("0x" + buf.toString("hex"))
      })
      var accounts = RLP.decode(Buffer.from(d[2]["updated accounts"], "base64")).map((buf) => {
        return "0x" + buf.toString("hex")
      })
      var fee = Number.parseInt(d[3]["fee"])
      const code = stm.submitBlock(next, d[0], d[1], accounts, balances, fee)
      console.log(code.byteCode);
      // const result = await employ(pro, 1, code.byteCode, null);
      // console.log(result);
    }

    // Download & Send
    var e = await Promise.all([
      call.depoAccounts(root, pro),
      call.exitAccounts(root, pro)
    ])
    if (e[0].error == undefined &&
      e[1].error == undefined){
      var dmax = e[0].length
      var emax = e[0].length
      for (var acc of depAccounts) {
        const argv = {
          t: acc.Address,
          a: acc.Amount,
          o: acc.Type,
          h: dmax + diff + next,
          f: 'mint',
          stop: true
        }
        await send(argv, pro)
      }
      for (var acc of exiAccounts) {
        const argv = {
          t: acc.Address,
          a: acc.Amount,
          o: acc.Type,
          h: emax + diff + next,
          f: 'melt',
          stop: true
        }
        await send(argv, pro)
      }

    }
  } else {

    console.log("not yet");
  }
}

/**
 * employ - general employ function
 *
 * @param  {type} pro     description
 * @param  {type} amount  description
 * @param  {type} payload description
 * @returns {type}         description
 */
async function employ(pro, amount, payload, nonce) {
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
      nonce != null ? initTx.AccountNonce = nonce : initTx.AccountNonce = await rpc.getAccountNonce(pub, "", -1);
      initTx.AccountNonce == 0 ? initTx.AccountNonce = 1 : initTx.AccountNonce = initTx.AccountNonce;
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
async function mustsend(tx, node, depth) {
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
          .then((d) => {
            var inf, add, txh, rch
            d[0].error ? inf = d[0].error.message : inf = d[0]
            d[1].error ? add = d[1].error.message : add = d[1]
            d[2].error ? txh = d[2].error.message : txh = d[2]
            d[3].error ? rch = d[3].error.message : rch = d[3]

            // console.log(inf.CurrentBlockHeight, inf.BlockAge, inf.PeerCnt, inf.Version);
            // console.log(add);
            // console.log(txh.status);
            // console.log(rch.failed, rch.contract, rch.totalFee, rch.usedGas, rch.result);
            var dep, sta, fal, con, res, tim, timeend = Date.now()
            txh.blockHeight == undefined ? dep = '_' : dep = inf.CurrentBlockHeight - txh.blockHeight;
            txh.status == undefined ? sta = '_' : sta = txh.status
            rch.failed == undefined ? fal = '_' : fal = rch.failed
            rch.contract == undefined ? con = '_' : con = rch.contract
            tim = parseInt((timeend - timebeg) / 1000)

            if (add === true) {} else if (JSON.stringify(add).includes('exists')) {
              add = 'exists'
            } else if (JSON.stringify(add).includes('duplicate')) {
              add = 'exists'
            } else if (JSON.stringify(add).includes('nonce is too small')) {
              add = 'nonce err'
            } else {
              add = add.slice(0, 50)
            }


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

            if (txh.status == 'block' && dep != '_' && dep >= depth) {
              resolve('block')
              clearInterval(done);
            } else if (typeof add == 'object' && JSON.stringify(add).includes('nonce is too small')) {
              resolve('nonce too small')
              clearInterval(done);
            } else {}
          })
      }, 1000);
    } catch (e) {
      console.error(e);
      reject(e)
    }
  });
}


module.exports = {
  fillHashes: fillhashes,
  stemrequest: stemrequest,
  adtx: adtx,
  keep: keep,
  mustsend: mustsend
}
