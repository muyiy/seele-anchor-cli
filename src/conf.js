const fs = require('fs-extra');
const path = require('path');
const seele = require('seele-sdk-javascript')

/**
 * conf - description
 *
 * @param  {string} cwd current working directory
 * @param  {string} dir directory subchain
 * @param  {string} pro project name
 * @return {type}     description
 */
async function conf(cwd, dir, pro) {
  const src = path.join(__dirname, 'rsc');
  const dst = path.join(cwd, dir, pro, 'src');

  await fs.remove(dst);
  await fs.copy(src, dst, {overwrite: true});

  const fig = path.join(cwd, dir, pro, 'conf.json');
  const obj = await fs.readJson(fig, {throws: false});
  obj.subchain = {'node': 'http://localhost:8035'};
  // obj.
  obj.constructors = {
    'StemRootchain.sol':[
      [
  			{ "name": "_subchainName", "type": "bytes32" },
  			{ "name": "_genesisInfo", "type": "bytes32[]" },
  			{ "name": "_staticNodes", "type": "bytes32[]" },
  			{ "name": "_creatorDeposit", "type": "uint256" },
  			{ "name": "_ops", "type": "address[]" },
  			{ "name": "_opsDeposits", "type": "uint256[]" },
  			{ "name": "_refundAccounts", "type": "address[]" }
  		],
      [
        "",
        [],
        [],
        "",
        [],
        [],
        [],
      ],
      1000
    ]
  }
  await fs.writeJson(fig, obj, {spaces: 2, EOL: '\n'});
}

/**
 * getConf - description
 *
 * @param  {type} pro description
 * @returns {type}     description
 */
async function getConf(pro) {
  const confpath = path.join(pro, 'conf.json');
  const obj = await fs.readJson(confpath, {throws: true});
  return obj;
}

/**
 * setConf - description
 *
 * @param  {type} pro description
 * @param  {type} obj description
 * @returns {type}     description
 */
async function setConf(pro,obj){
  const fig = path.join(pro, 'conf.json')
  await fs.writeJson(fig, obj, {spaces: 2, EOL: '\n'});
}

/**
 * getNode - description
 *
 * @param  {type} pro description
 * @returns {type}     description
 */
async function getNode(pro){
  const obj = await getConf(pro)
  const shard = seele.key.shard(obj.transactions.fromAddress)
  return obj.shard[shard]
}

/**
 * getAbi - description
 *
 * @returns {type}  description
 */
async function getAbi(root){
  const abipath = path.join(root,'src','json','StemRootchain.json');
  const abi = await fs.readJson(abipath, {throws: true});
  return abi;
  // console.log(abipath);
}

/**
 * bftConf - description
 *
 * @param  {type} pro description
 * @returns {type}     description
 */
async function bftConf(root, pro){
  try {
    const bftsrc = path.join(root,'src','json','bft.json');
    const bftdst = path.join(pro,'bft.json')
    var bft = await fs.readJson(bftsrc, {throws: true});
    var con = await getConf(pro);
    var genesis = con.constructors['StemRootchain.sol'][1][1]
    var opsaddr = con.constructors['StemRootchain.sol'][1][4]
    var opsdepo = con.constructors['StemRootchain.sol'][1][5]
    var subaddr = con.addressBook['StemRootchain.sol']

    bft.genesis.hashes = genesis
    bft.genesis.rootaccounts = [
      opsaddr[0],
      opsaddr[1]
    ]
    // mint, melt, roll
    bft.genesis.validator = opsaddr.slice(2)
    bft.genesis.validatorDeposits = opsdepo.slice(2)

    await fs.writeJson(bftdst, bft, {spaces: 2, EOL: '\n'});
  } catch (e) {

  } finally {

  }


}

module.exports = {
  conf: conf,
  getAbi: getAbi,
  getConf: getConf,
  setConf: setConf,
  getNode: getNode,
  bftConf: bftConf
};
