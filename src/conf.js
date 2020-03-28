
// const fs = require('fs-extra');
// const seele = require('seele-sdk-javascript')
const fs = require('fs-extra');
const path = require('path');
const home = require('os').homedir();
const root = '.subchain'
const rootdir = path.join(home, root)
const settings = {
  focus: 'subchainFocus',
  file: 'ancconf.json'
}
const store = require('data-store')({ path: path.join(rootdir, settings.file) });

async function _run(str){
  return new Promise(function(resolve, reject) {
    const CliTest = require('command-line-test');
    const cliTest = new CliTest();
    cliTest.exec(str)
    .then((d)=>{resolve(d)})
    .catch((e)=>{reject(e)})
  });
}

async function viewKeep(){
  // var result = await _run("")
  console.log(result);
}

async function killKeep(){

}

async function cronKeep(){

}

async function updateAddressbook(){

}

/**
 * conf - description
 *
 * @param  {string} cwd current working directory
 * @param  {string} dir directory subchain
 * @param  {string} pro project name
 * @return {type}     description
 */
async function conf(pro, overwrite) {
  try {
    // overwrite
    const fs = require('fs-extra');
    const prodir = path.join(home, root, pro)
    if (overwrite) await fs.remove(prodir);

    // create directory and files
    const init = require('seele-contract-core').init;
    await init(home, root, pro)

    // copy solidiy source codes
    const srcsol = path.join(__dirname, 'sol');
    const dstsol = path.join(rootdir, pro, 'src')
    await fs.remove(dstsol);
    await fs.copy(srcsol, dstsol, {overwrite: true});

    // copy working configuration file
    const srccon = path.join(__dirname, 'json', 'conf.json')
    const dstcon = path.join(rootdir, pro, 'conf.json')
    await fs.remove(dstcon);
    await fs.copy(srccon, dstcon, {overwrite: true});

    // focus on project
    await store.set(settings.focus, pro)
  } catch (e) {
    console.error(e);
  } finally {
    // console.log('Initiated');
  }
}

/**
 * list - remove, change before always showing the focused subchain
 *
 * @param  {type} remove description
 * @param  {type} change description
 * @returns {type}        description
 */
async function list(remove, change, loud){
  var projects = await fs.readdir(rootdir).then(d=>{
    return d.filter(function(e) { return e !== settings.file })
  })
  projects = projects.filter(function(e) { return e !== "node" })

  if ( projects.includes(change) ) {
    await store.set(settings.focus, change)
  } else if( change==undefined ) {
  } else {
    console.log('unrecognized switch:', change);
  }

  if ( projects.includes(remove) && remove == store.get(settings.focus) && projects.length>=1) {
    await fs.remove(path.join(rootdir, remove))
    projects = projects.filter(function(e) { return e !== remove })
    var foo
    projects.length==0?foo="":foo=projects[0]
    await store.set(settings.focus, foo)
  } else if( remove==undefined ) {
  } else {
    console.log('unrecognized remove:', remove);
  }


  const term = require( 'terminal-kit' ).terminal;
  const focus = store.get(settings.focus)
  // console.log(projects);
  //
  if (loud==true) {
    for ( var project of projects ) {
      if ( project == focus ) {
        term.green('\t- '+project).green(' • \n')
      } else {
        term('\t- '+project+'\n')
      }
    }
  }

  // console.log(focus);
  return path.join(rootdir,focus)
}

/**
 * getConf - description
 *
 * @param  {type} pro description
 * @returns {type}     description
 */
async function getConf() {
  const list = require('./conf').list
  const pro = await list(null,null,false)
  const fs = require('fs-extra');
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
  await fs.writeJson(fig, obj, {spaces: 2, EOL: '\n'})
  .catch(e=>{console.log(e);});
}

/**
 * getNode - description
 *
 * @param  {type} pro description
 * @returns {type}     description
 */
async function getNode(pro, shard){
  const seele = require('seele-sdk-javascript');
  const obj = await getConf(pro)
  var s = seele.key.shard(obj.transactions.fromAddress)
  var str = shard
  if (`${str}`.match(/[1-4]/g)){ s = shard }
  return obj.shard[s]
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
  list: list,
  conf: conf,
  getAbi: getAbi,
  getConf: getConf,
  setConf: setConf,
  getNode: getNode,
  bftConf: bftConf,
  updateAddressbook: updateAddressbook
};
