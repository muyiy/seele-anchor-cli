const fs = require('fs-extra')

// doso()


b2s()

async function b2s(){
  var x = 'hellochain subo'
  var y = Buffer.from(x)
  console.log(y.toString('hex'));
  console.log(y.toString());
  // y.toString()

}

async function doso(){
  var result = await fs.readJson('StemRootchain.json', {throw: true})
  // console.log(result )
  for ( item of result ) {
    if ( item.type == 'function' && item.stateMutability != 'view') {
      console.log(item.name);
    }
  }
}


const view = {
  panels:{
    relay: {
      isLastChildBlockConfirmed: '',
      getLastChildBlockNum: 'height of relayed block',
      getNextChildBlockNum: 'height of relayed block',
    },
    challenge: {
      getChallengeTarget: 'get target by id',
      getChallengeId: 'get id from array',
      getChallengeLen: 'get total challenge length'
    },
    status: {
      isFrozen: '',
      getOwner:'',
      getChildChainName: '',
      getStaticNodes:'',
      getContractBalance:'',
      getTotalDeposit:'',
      getCreatorDeposit:'',
      getTotalBalance:'',
      getTotalFee:'',
    },
  },
  lookup:{
    backup: {
      getBalanceBackup: 'the array of changed balance and their previous balance',
      getAccountBackup: 'the array of the accounts',
      getFeeBackup: 'the last fee used for operators',
      getTotalDepositBackup: 'the last total deposit'
    },
    relayHistory: {
      getChildBlockSubmitter: 'get submitter by height',
      getChildBlockBalanceRootHash: '',
      getChildBlockTxRootHash: '',
      getChildBlockTimestamp: ''
    },
    trade: {
      getCurExitBlockNum: '??? available spot',
      getExitBlockNum: 'find your spot',
      getExitType:'',
      getExitAccounts:'',
      getExitAmount:'',
      getExitStatus:'',
      getExitsLen: 'how many people exiting',
      getCurDepositBlockNum: '??? available spot',
      getDepositBlockNum: 'find your spot',
      getDepositType:'',
      getDepositAccounts:'',
      getDepositAmount:'',
      getDepositsLen:''
    },
    operator: {
      isOperatorExisted: '',
      getOperatorBalance: '',
      getOperatorFee: '',
      getOps:'',
      getOpsLen:''
    },
    user: {
      isUserExisted: '',
      getUserBalance: '',
      getUsersLen:''
    }
  }
}


const dos = {
  trade: {
    operatorAddRequest: '',
    operatorExitRequest: '',
    userDepositRequest: '',
    userExitRequest: '',
    removeDepositRequest: '',
    removeExitRequest: '',
    execOperatorExit: '',
    execUserExit: '',
    feeExit: '',
  },
  relay:{
    submitBlock: '',
    reverseBlock: '',
  },
  challenge:{
    challengeSubmittedBlock: '',
    responseToBlockChallenge: '',
  },
  status:{
    timeOutDiscard: '',
    discard: '',
  }
}
