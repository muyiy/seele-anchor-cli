pragma solidity ^0.4.24;

// external modules
import "./SafeMath.sol";
import "./StemCore.sol";
import "./StemRelay.sol";

// This library includes the construtor of a Stem contract
library StemCreation {
    using SafeMath for uint256;

     /**
     * @dev The rootchain constructor creates the rootchain
     * contract, initializing the owner and operators
     * @param _subchainName The name of the subchain
     * @param _genesisInfo [balanceTreeRoot, TxTreeRoot]
     *        The hash of the genesis balance tree root
     *        The hash of the genesis tx tree root
     * @param _staticNodes The static nodes
     * @param _creatorDeposit The deposit of creator
     * @param _ops The operators. The first two accounts are used for mintAccount and meltAccount
     * @param _opsDeposits The deposits of operators. The first two elements are not used, should be set as 0
     * @param _refundAccounts The mainnet addresses of the operators. The first two elements are not used, should be set as address(0)
     * @param _msgSender the creator of the contract
     * @param _msgValue  value deposited into the contract
     */
    function createSubchain(StemCore.ChainStorage storage self, bytes32 _subchainName, bytes32[] _genesisInfo, bytes32[] _staticNodes, uint256 _creatorDeposit, address[] _ops, uint256[] _opsDeposits, address[]  _refundAccounts, address _msgSender, uint256 _msgValue) public {
        // initialize the storage variables
        init(self);
        require(_ops.length >= self.MIN_LENGTH_OPERATOR + 2 && _ops.length <= self.MAX_LENGTH_OPERATOR + 2, "Invalid operators length");
        require(_ops.length == _opsDeposits.length, "Invalid deposits length");
        require(_ops.length == _refundAccounts.length, "Invalid length of refund accounts");
        require(_creatorDeposit >= self.creatorMinDeposit, "Insufficient creator deposit value");
        require(_genesisInfo.length == 2, "Invalid length of genesis info");
        // Setup the operators' deposits and initial fees
        self.totalDeposit = _creatorDeposit;
        self.mintAccount = _ops[0];
        self.meltAccount = _ops[1];
        for (uint256 i = 2; i < _ops.length && StemCore.isValidAddOperator(self, _ops[i], _opsDeposits[i]); i++){
            require(self.isExistedOperators[_ops[i]] == false, "Repeated operator");
            self.operators[_ops[i]] = _opsDeposits[i];
            self.operatorFee[_ops[i]] = 0;
            self.totalDeposit = self.totalDeposit.add(_opsDeposits[i]);
            self.isExistedOperators[_ops[i]] = true;
            self.operatorIndices.push(_ops[i]);
            self.refundAddress[_ops[i]] = _refundAccounts[i];
        }
        require(_msgValue >= self.totalDeposit, "You don't give me enough money");
        self.owner = _msgSender;
        self.creatorDeposit = _creatorDeposit;

        // Register subchain info
        self.subchainName = _subchainName;
        self.staticNodes = _staticNodes;
        uint256 submittedBlockNumber = 0;
        //Create the genesis block.
        self.childBlocks[submittedBlockNumber] = StemCore.ChildBlock({
            submitter: _msgSender,
            balanceTreeRoot: _genesisInfo[0],
            txTreeRoot: _genesisInfo[1],
            timestamp: block.timestamp
        });

        // update child block number/deposit block number/exit block number
        self.nextChildBlockNum = 0;
        self.nextChildBlockNum = self.nextChildBlockNum.add(self.CHILD_BLOCK_INTERVAL);
        self.nextDepositBlockIncrement = 1;
        self.curDepositBlockNum = self.nextChildBlockNum.add(self.nextDepositBlockIncrement);
        self.nextExitBlockIncrement = 1;
        self.curExitBlockNum = self.nextChildBlockNum.add(self.nextExitBlockIncrement);
        // By default, all the initial operators' deposit should be processed on the subchain at genesis block. (The genesis block height is 0)
    }

     /**
    * @dev Initialize the contract parameters
     */
    function init(StemCore.ChainStorage storage self) internal {
        self.MIN_LENGTH_OPERATOR = 1;
        self.MAX_LENGTH_OPERATOR = 100;
        self.CHILD_BLOCK_INTERVAL = 50;
        self.IS_NEW_OPERATOR_ALLOWED = true;
        self.creatorMinDeposit = 1;
        self.childBlockChallengePeriod = 6 seconds;//1 days;
        self.childBlockChallengeSubmissionPeriod = 3 seconds;//12 hours;
        self.relayTimeout = 10 minutes;
        self.isBlockSubmissionBondReleased = true;
        self.blockSubmissionBond = 1;
        self.blockChallengeBond = 1;
        self.operatorMinDeposit = 3;
        self.userMinDeposit = 2;
        self.userExitBond = 1;
        self.isFrozen = false;
    }

    /**
    * @dev Discard the subchain
     */
    function discardSubchain(StemCore.ChainStorage storage self) public {
        require(self.isFrozen == false, "The subchain is frozen");

        self.isFrozen = true;
        if (StemCore.isLastChildBlockConfirmed(self) == false) {
            StemRelay.forceReverseBlock(self, self.lastChildBlockNum);
        }
        // return owner's deposit
        self.owner.transfer(self.creatorDeposit);
        address acc;
        // return users' deposit
        for (uint i = 0; i < self.userIndices.length; i++) {
            acc = self.userIndices[i];
            self.refundAddress[acc].transfer(self.users[acc]);
        }
        // return operators' deposit
        for (i = 0; i < self.operatorIndices.length; i++) {
            acc = self.operatorIndices[i];
            self.refundAddress[acc].transfer(self.operatorFee[acc].add(self.operators[acc]));
        }
        // return the deposits in the deposit requests
        for (i = 0; i < self.depositsIndices.length; i++) {
            acc = self.depositsIndices[i];
            if (self.deposits[acc].blkNum > self.lastChildBlockNum) {
                self.deposits[acc].refundAccount.transfer(self.deposits[acc].amount);
            }
        }

        // return all the user exit bonds
        for (i = 0; i < self.exitsIndices.length; i++) {
            acc = self.exitsIndices[i];
            if (self.exits[acc].isOperator == false || self.exits[acc].executed == false) {
                self.refundAddress[acc].transfer(self.userExitBond);
            }
        }

        // return blockSubmissionBond
        if (!self.isBlockSubmissionBondReleased)
        {
            self.childBlocks[self.lastChildBlockNum].submitter.transfer(self.blockSubmissionBond);
            self.isBlockSubmissionBondReleased = true;
        }
    }
}
