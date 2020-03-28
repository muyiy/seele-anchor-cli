#!/usr/bin/env node
const home = require('os').homedir();
const path = require('path')
const subc = "~/go/src/github.com/seeleteam/go-seele-sub"
const manc = "~/go/src/github.com/seeleteam/go-seele-main"
const comp = "~/go/src/github.com/seeleteam/go-seele"
const rootdir = path.join(home, '.subchain', 'node')
const mainnodepath = path.join(rootdir,'node')
const stemnodepath = path.join(rootdir,'sub','node')
const store = require('data-store')({ path: rootdir + '/nodecliconfig.json' });
const CliTest = require('command-line-test');

function getJsonDeep(arr, obj){
  if ( arr.length == 1 ) {
    return obj[arr[0]]
  } else {
    return getJsonDeep(arr.slice(1), obj[arr[0]])
  }
}

async function getAll(sncConfField, nodeConfField){
  const fs = require("fs-extra")
  const conflist = store.get(sncConfField)
  // console.log(conflist);
  var fieldlist = []
  for (var conf of conflist) {
    var nodeConf = await fs.readJson(path.join(rootdir, conf))
    // console.log(nodeConfField.split("."));
    var res = getJsonDeep(nodeConfField.split("."), nodeConf)
    fieldlist.push(res)
  }
  // console.log(fieldlist);
  return fieldlist
}

async function _run(str){
  return new Promise(function(resolve, reject) {
    const cliTest = new CliTest();
    cliTest.exec(str)
    .then((d)=>{resolve(d)})
    .catch((e)=>{reject(e)})
  });
}

function infodisplay(info, verbose, type, obj){
  const term = require('terminal-kit').terminal;
  if (typeof info != 'string'){
    term
    .green(`${type} port: `)
    .white(`${obj.port.replace(/.*:/,'')}`)
    .green(`, pid: `)
    .white(`${obj.pid} \t`)
    if (verbose) {
      console.log(obj, info);
    } else {
      term
      .green(`• ${type} height: `)
      .white(`${info.CurrentBlockHeight}(${info.BlockAge}s), `)
      .green(`shard: `)
      .white(`${info.Shard}, `)
      .green(`peer: `)
      .white(`${info.PeerCnt}\n`)
      // .white(`${obj.port.replace(/.*:/,'')}`)
    }
  } else {
    term
    .yellow(`${type} port: ${obj.port.replace(/.*:/,'')}, pid: ${obj.pid}, `)

    term
    .red(`✗ ${info}\n`)
  }
}

const yargs = require("yargs")
.command('init','Initiate configuration directory',
  (yargs)=>{
    yargs
    .option('overwrite', {
      alias: 'o',
      type: 'boolean'
    })
  },
  async (argv)=>{
    console.log(argv);
    if (argv.o) {
      await _run(`rm -rf ${rootdir}`)
    }
    var result = await _run(`mkdir -p ${rootdir}; cp -r ${__dirname}/* ${rootdir}`)
    // console.log(result);
  }
)
.command('list','List running nodes',
  (yargs)=>{
    yargs
    .option('long', {
      alias: '-l',
      type:'boolean',
      description: 'Long display',
      default: false
    })
    .hide('version')
  },
  async (argv)=>{
    const term = require('terminal-kit').terminal;
    const sle = require('seele-sdk-javascript');
    const stm = require('seele-stemsdk-javascript');
    term.saveCursor()

    var done = setInterval(async function() {
      term
      .restoreCursor()
      .saveCursor()
      .eraseDisplayBelow()

      var main = store.get('main-info')
      var verbose = argv.verbose
      var type = 'MAIN'
      for ( var obj of main ) {
        var rpc = new sle.rpc('http://' + obj.port.replace('0.0.0.0', 'localhost'))
        await rpc.getInfo()
        .then(d=>{
          infodisplay(d, verbose, type, obj)
        })
        .catch(e=>{
          infodisplay("cannot connect", verbose, type, obj)
        })
      }
      var stem = store.get('stem-info')
      type = 'SUB'
      for ( var obj of stem ) {
        var rpc = new stm.rpc('http://' + obj.port.replace('0.0.0.0', 'localhost'))
        await rpc.getInfo()
        .then(d=>{
          infodisplay(d, verbose, type, obj)
        })
        .catch(e=>{
          infodisplay("cannot connect", verbose, type, obj)
        })
      }

      if ( !argv.maintain ) {
        clearInterval(done);
      }
    }, 2000)
  }
)
.command('kill','Kill running node',
  (yargs)=>{
    yargs
    .option('index', {
      alias:'i',
      type:'number',
      description:'kill by index'
    })
    .option('all', {
      alias:'a',
      type:'bool',
      description:'kill all',
      default: true
    })
  },
  (argv)=>{
    const spawn = require('child_process').spawn;
    const ki = spawn('pkill', ['node'])
    store.set('main-info',[])
    store.set('stem-info',[])
  }
)
.command('node', 'Node options',
  (yargs)=>{
    yargs
    .command('version', 'Version of Node',
      (yargs)=>{
        yargs
        .option('subchain', {
          alias: 's',
          type: 'boolean',
          default: false
        })
      },
      async (argv)=>{
        // const spawn = require('child_process').spawn;
        var node
        argv.s? node = stemnodepath:node=mainnodepath
        const vi = await _run(`${node} -v`)
        console.log(`node version: ${vi.stdout}`);
        // });
    })
    .command('compile', 'Compile local node',
      (yargs)=>{
        yargs
        .option('subchain', {
          alias: 's',
          type: 'boolean',
          default: false
        })
      },
      async (argv)=>{
        var src
        argv.s? src = subc : src = manc
        if ( argv.s ) {
          await _run(`rm -rf ${comp}; cp -r ${subc} ${comp}`)
        } else {
          await run(`rm -rf ${comp}; cp -r ${manc} ${comp}`)
        }

        var make = await _run(`\
          cd ${src};\
          make node client;\
        `)
        console.log(make);
        var dst
        argv.s? dst = path.join(rootdir, 'sub'): dst=rootdir

        var copy = await _run(`\
          cp -f ${src}/build/node ${dst}/node;\
          cp -f ${src}/build/client ${dst}/client;\
        `)
        console.log(copy);
      },
    )
    .command('download', '[todo] Download from gihub',
      (yargs)=>{},
      async(argv)=>{}
    )
  }, (argv)=>{

  }
)
.command('start', 'Starting node',
  (yargs)=>{
    yargs
    .option('main', {
      alias: 'm',
      type: 'boolean'
    })
    .option('stem', {
      alias: 's',
      type: 'bool'
    })
    .option('vote', {
      type: 'string',
      description: 'start/stop',
      default: 'start'
    })
    .option('all', {
      alias: 'a',
      type: 'boolean',
      default: true
    })
    .hide('version')
  },
  async (argv)=>{
    const term = require('terminal-kit').terminal;
    const fs = require('fs-extra')
    const spawn = require('child_process').spawn;

    if ( argv.s || argv.m ) {
      argv.a = false
    } else if (argv.a) {
      argv.m = true
      argv.s = true
    }

    if (argv.m){
      var main = store.get('main-conf')
      for ( var conf of main ) {
        const proc = await spawn( mainnodepath ,
        [
          'start',
          '-c',
          rootdir+'/'+conf
        ],{stdio: 'ignore',detached: true})
        const objc = await fs.readJson(rootdir+'/'+conf)

        store.union('main-info', {conf: conf,port: objc.httpServer.address,pid: proc.pid});
        proc.unref();
        term
        .green(`\n • MAIN node started with: `)
        .white(conf)
        .green(` , at pid: `)
        .white(proc.pid)
      }
    }

    if (argv.s){
      var stem = store.get('stem-conf')

      for ( var conf of stem ) {
        const proc = await spawn(stemnodepath,
        [
          'substart',
          '-s',
          rootdir+'/'+conf,
          '-v',
          argv.vote
        ], {stdio: 'ignore',detached: true})
        const objc = await fs.readJson(rootdir+'/'+conf)
        store.union('stem-info', {conf: conf,port: objc.httpServer.address,pid: proc.pid});
        proc.unref();
        term
        .green(`\n • SUB node started with: `)
        .white(conf)
        .green(` , at pid: `)
        .white(proc.pid)
      }
    }

    console.log('\n');

  }
)
.command('clean', 'cleaning node database',
  (yargs)=>{
    yargs
    .option('main', {
      alias: 'm',
      type: 'boolean'
    })
    .option('stem', {
      alias: 's',
      type: 'bool'
    })
    .option('all', {
      alias: 'a',
      type: 'boolean',
      default: true
    })
    .hide('version')
  },
  async (argv)=>{
    if ( argv.s || argv.m ) {
      argv.a = false

      if (argv.s) {
        var dirs = await getAll("stem-conf", "basic.dataDir")
        for ( var dir of dirs ) {
          const rm = await _run(`
            rm -rf ~/.seele/${dir};
            rm -rf ~/seeleTemp/log/${dir};
          `)
        }
      }

      if (argv.m) {
        var dirs = await getAll("main-conf", "basic.dataDir")
        for ( var dir of dirs ) {
          const rm = await _run(`
            rm -rf ~/.seele/${dir};
            rm -rf ~/seeleTemp/log/${dir};
          `)
        }
      }

    } else if (argv.a) {
      argv.m = true
      argv.s = true
      const rm = await _run("rm -rf ~/.seele; rm -rf seeleTemp;")
      console.log(rm);
    }

  }
)
.option('version', {alias: 'v', type: 'boolean', description: 'Show version'})
.option('help', {alias: 'h', type: 'boolean', description: 'Show help'})
.argv;
