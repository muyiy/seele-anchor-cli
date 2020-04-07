const cli = require("../cli.js");
const {assert, expect}    = require('chai');
const fs = require("fs-extra")
const CliTest = require('command-line-test');
const project_name = 'testchain'
const srcconf = `${__dirname}/json/conf.json`
const dstconf = `${process.cwd()}/.subchain/${project_name}/conf.json`
const dstdir = `.subchain/${project_name}`
// constructor[0] = mint
// constructor[1] = melt

async function run(str){
  console.log(str);
  return new Promise(function(resolve, reject) {
    const cliTest = new CliTest();
    cliTest.exec(str)
    .then((d)=>{resolve(d)})
    .catch((e)=>{reject(e)})
  });
}

function quotify(str){
  var quoted = str.replace(/ /g, "")
  .replace(/{/g, "{\"")
  .replace(/}/g, "\"}")
  .replace(/,/g, "\",\"")
  .replace(/:/g, "\":\"")
  return quoted
}

describe.skip('Starting a Project', function() {
  it.skip('----snc start main----, start main chain', async function() {
    await run('snc kill')
    await run('snc start -m')
    const list = await run('snc list')
    expect(list.stdout).to.include('peer')
  })

  it.skip('Installation: "npm i -g seele-anchor-cli", anc installation', ()=>{
  })

  it('Version: "anc -v", check anc version', async function () {
    const res = await run('anc -v')
    expect(res.stdout).to.match(/[0-9]+\.[0-9]+\.[0-9]+/)
  });

  it.skip('Initiate: "anc init", initiate subchain project directory', async function() {
    const res = await run(`anc init -n ${project_name}`)
    assert.equal(res.error, null)
    assert.equal(res.stderr, '')
  })

  it.skip('Fill: "anc fill"', async function() {
    fs.copySync(srcconf,dstconf,{overwrite:true})
    await run(`cd ${dstdir}; anc fill;`)
    const result = await fs.readJson(dstconf, { throws: false })
    expect(result.constructors['StemRootchain.sol'][1][1]).to.not.eql([])
  })

  it.skip('Compile: "anc make -c"', async function() {
    const result = await run(`cd ${dstdir}; anc make -c;`)
    assert.equal(res.error, null)
    assert.equal(res.stderr, '')
  })

  it.skip('Deploy: "anc make -d"', async function() {
    const result = await run(`cd ${dstdir}; anc make -d;`)
    console.log(result);
    assert.equal(result.error, null)
    assert.equal(result.stderr, '')
  })

  it('Display: "anc show"', async function() {
    const result = await run(`cd ${dstdir}; anc show;`)
    expect(result.stdout.split('\n')[4]).to.equal('  isFrozen: false,')
  })

  it.skip('----snc kill----, kill all chains', async function() {
    const kill = await run('snc kill')
    expect(kill.stdout).to.equal('')
  })

})

describe.skip('Basic maintenance', function(){

  it('----snc start----, start subchain and mainchain', async function() {
    await run('snc kill')
    await run('snc start -m')
    const list = await run('snc list')
    expect(list.stdout).to.include('peer')
  })

  it('Generate config: "anc show generate"', async function() {
    const result = await run('anc show generate')
    console.log(result);
  })

  it('Transfer: "anc adtx"', async function() {
    // var to = pri2[0].mainchain.address
    var to = pri1[0].subchain.mainchain


    var result = await run(`
      cd ${dstdir};\
      anc adtx\
      --from ${base.private}\
      --to ${to}\
      --amount 600000000;\
    `)

    var info = await run(`
      cd ${dstdir};\
      anc main account\
      --address ${to}
    `)

    expect(JSON.parse(quotify(info.stdout)).Balance).to.not.equal(0)
  })

  it('Deposite: "anc trade in"', async function() {

    var trade = await run(`
      cd ${dstdir};\
      anc trade in\
      --operator\
      --privatekey ${pri2[0].mainchain.private}\
      --subaddress ${pri2[0].subchain.mainchain}\
      --amount 99\
    `)
    // --subaddress 0x3f78b08f45730f59a15319af41ba5a750021c541\

    console.log(trade);
  })

  it('Exit: "anc trade out"', async function() {
    var trade = await run(`
      cd ${dstdir};\
      anc trade out\
      --privatekey ${base.private}\
      --operator\
      --subaddress ${pri1[0].subchain.mainchain}\
    `)
    // --privatekey ${pri1[0].subchain.private}\

  })

  it('Relay: "anc keep"', async function() {
    var keep = await run(`
      cd ${dstdir};\
      anc keep\
    `)
    console.log(keep);
  })

  it('Status: "anc look"', async function() {

  })

  it('Stem api: "anc view"', async function() {

  })

  it('----snc kill----, kill all chains', async function() {
    const kill = await run('snc kill')
    expect(kill.stdout).to.equal('')
  })

})
