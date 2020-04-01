#!/usr/bin/env node


// const {conf, getAbi, read, getConf, bftConf, updateAddressbook} = require('./src/conf');
// const {fillHashes, stemrequest, adtx, keep} = require('./src/dep')
// const {send} = require('./src/send')
// const call = require('./src/call')
// const {init, ContractBase} = require('seele-contract-core');
// const stem = require('seele-stemsdk-javascript');
// const seele = require('seele-sdk-javascript');
// const term = require( 'terminal-kit' ).terminal;
// const cwd = process.cwd();

'use strict';
const yargs = require("yargs");

const anc = yargs
  .command('init', 'Initiate subchain project',
    (yargs) => {
      yargs
        .option('name', {
          alias: 'n',
          type: 'string',
          description: 'subchain project name',
          demandOption: true,
        })
        .option('forceOverwrite', {
          alias: 'f',
          type: 'boolean'
        })
        .hide('version');
    },
    async (argv) => {
      const conf = require('./src/conf').conf;
      await conf(argv.n, argv.f);
    }
  )
  .command('list', 'List to remove or switch project',
    (yargs) => {
      yargs
        .option('remove', {
          alias: 'r',
          type: 'string',
          description: 'Remove project'
        })
        .option('switch', {
          alias: 's',
          type: 'string',
          description: 'Switch to project'
        })
        .hide('version')
    },
    async (argv) => {
      const list = require('./src/conf').list;
      await list(argv.remove, argv.switch, true)
    }
  )
  .command('keys', 'Generate the keys',
    (yargs) => {
      yargs
        .option('pri', {
          alias: 'p',
          type: 'string',
          description: 'privatekey to fill',
          default: '',
        })
        .option('shard', {
          alias: 's',
          type: 'number',
          description: 'shard number of keys',
          default: 1,
          demandOption: false,
        })
        .hide('version');
    },
    (argv) => {
      const stem = require('seele-stemsdk-javascript');
      const seele = require('seele-sdk-javascript');
      const slekey = seele.key.spawn(argv.s);
      const stmkey = seele.key.spawn(argv.s);
      var obj
      if (argv.p != '') {
        obj = {
          shard: seele.key.shard(seele.key.addof(argv.p)),
          address_sle: seele.key.addof(argv.p),
          address_eth: stem.key.addof(argv.p),
          private: argv.p
        }
      } else {
        obj = {
          subchain: {
            shard: argv.s,
            address_sle: stmkey.address,
            address_eth: stem.key.addof(stmkey.privateKey),
            private: stmkey.privateKey
          },
          mainchain: {
            shard: argv.s,
            address_sle: slekey.address,
            address_eth: stem.key.addof(slekey.privateKey),
            private: slekey.privateKey
          }
        }
      }
      console.log(JSON.stringify(obj, null, 2));
    },
  )
  .command('fill', 'Fill hashes for Subhchain',
    (yargs) => {},
    async (argv) => {
      const cwd = await process.cwd();
      const {
        fillHashes
      } = require('./src/dep')
      await fillHashes(cwd);
    },
  )
  .command('make', 'Deploy subchain contracts',
    (yargs) => {
      yargs
        .option('compile', {
          alias: 'c',
          type: 'boolean',
          description: 'Compile to bytecode',
          default: false,
        })
        .option('deploy', {
          alias: 'd',
          type: 'boolean',
          description: 'Deploy to seele mainnet',
          default: false,
        })
        .hide('version');
    },
    async (argv) => {
      const {
        list
      } = require('./src/conf')
      var pro = await list()
      const ContractBase = require('seele-contract-core').ContractBase;
      const contract = new ContractBase(pro);
      if (argv.c && !argv.d) {
        contract.compile();
      } else if (!argv.c && argv.d) {
        contract.deploy();
      } else if (argv.c && argv.d) {
        new Promise((resolve, reject) => {
            resolve('');
          })
          .then((d) => {
            return contract.compile();
          })
          .then((d) => {
            return contract.deploy();
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        console.log('Option missing: either c or d');
      }
    },
  )
  .command('show', 'Subchain contract summary',
    (yargs) => {
      yargs
        .command('generate', 'Generates subchain config file from contract',
          (yargs) => {},
          (argv) => {
            console.log(argv);
            console.log('download config file from contract!');
          },
        )
        .option('user', {
          alias: 'u',
          type: 'boolean',
          description: 'User panel',
          default: true
        })
        .option('creator', {
          alias: 'c',
          type: 'boolean',
          description: 'Creator panel',
          default: false
        })
        .option('operator', {
          alias: 'o',
          type: 'boolean',
          description: 'Operator panel',
          default: false
        })
        .option('all', {
          alias: 'a',
          type: 'boolean',
          description: 'All panels',
          default: false
        })
        .option('verbose', {
          alias: 'b',
          type: 'boolean',
          description: 'More details',
          default: false
        })
        .hide('version');
    },
    async (argv) => {
      const call = require('./src/call')
      const seele = require('seele-sdk-javascript');
      const term = require('terminal-kit').terminal;
      const {
        list
      } = require('./src/conf')
      var cwd = await list()
      // var abi = await getAbi(__dirname);
      // var subchain = new seele.contract(address,abi);
      // if (argv.e) {
      //   console.log('make config');
      //   const cwd = await process.cwd();
      //   bftConf(__dirname, cwd);
      // }

      const {
        getConf
      } = require('./src/conf');
      var config = await getConf(cwd);
      const address = config.addressBook['StemRootchain.sol'];
      term
        .green('Address:\n')
      console.log(address);

      var ownr = await call.getOwner(__dirname, cwd)
      term
        .green('Owner:\n')
      console.log(ownr);

      var stat = await call.status(__dirname, cwd)
      term
        .green('Status:\n')
      console.log(stat);

      var chal = await call.challenge(__dirname, cwd)
      term
        .green('Challenge:\n')
      console.log(chal);

      var rlay = await call.relay(__dirname, cwd)
      term
        .green('Relay:\n')
      console.log(rlay);

      var depo = await call.depoAccounts(__dirname, cwd)
      var exit = await call.exitAccounts(__dirname, cwd)
      term
        .green('Traffic:\n')
      console.log({
        "In": depo,
        "Out": exit
      });



    },
  )
  .command('look', 'Subchain contract lookup',
    (yargs) => {
      yargs
        .command('bal', 'Account Balance',
          (yargs) => {
            yargs
              .option('account', {
                alias: 'a',
                type: 'string'
              })
              .option('list', {
                alias: 'l',
                type: 'boolean'
              })
          },
          async (argv) => {
            const call = require('./src/call');
            // const cwd = process.cwd();

            const {
              getConf,
              list
            } = require('./src/conf');
            const cwd = list(null, null)

            if (argv.list) {
              const acc = await call.allAccounts(__dirname, cwd)
              console.log(acc);
            }

            if (argv.a == undefined) {
              var cnf = await getConf(cwd)
              // console.log(cnf.subchain.self.address);

            } else {
              console.log(argv.a);
              call.oneAccount(__dirname, cwd, argv.a)
            }
          }
        )
    },
    async (argv) => {}
  )
  .command('stem', 'Subchain node api',
    (yargs) => {
      yargs
        .command('account', 'Account summary',
          (yargs) => {
            yargs
              .option('address', {
                alias: 'a',
                type: 'string',
                demandOption: true
              })
          },
          async (argv) => {
            const {
              accountInfo
            } = require('./src/stem')
            var info = await accountInfo(argv.a)
            console.log(info);
          }
        )
        .command('summary', 'Node summary', {
          
        })
    },
    (argv) => {}
  )
  .command('main', 'Mainchain node api',
    (yargs) => {
      yargs
        .command('account', 'Account summary',
          (yargs) => {
            yargs
              .option('address', {
                alias: 'a',
                type: 'string',
                demandOption: true
              })
          },
          async (argv) => {
            const {
              accountInfo
            } = require('./src/main')
            var info = await accountInfo(argv.a)
            console.log(info);
          }
        )
    },
    (argv) => {}
  )
  .command('trade', 'Trade (in/out/fee/undo)',
    (yargs) => {
      yargs
        .command('in', 'Trade in', (yargs) => {
          // yargs.option('privatekey', {alias: 'p', type: 'string', description: 'Privatekey'})
        }, async (argv) => {
          const cwd = await process.cwd();
          const {
            stemrequest
          } = require('./src/dep');
          stemrequest(__dirname, cwd, argv);
        })
        .command('out', 'Trade out', (yargs) => {
          // yargs.option('privatekey', {alias: 'p', type: 'string', description: 'Privatekey'})
        }, async (argv) => {
          const cwd = await process.cwd();
          const {
            stemrequest
          } = require('./src/dep');
          stemrequest(__dirname, cwd, argv);
        })
        .command('fee', 'Export fee', (yargs) => {}, async (argv) => {
          const cwd = await process.cwd();
          stemrequest(__dirname, cwd, argv);
        })
        .option('operator', {
          alias: 'o',
          type: 'boolean',
          description: 'Change operator status',
          default: false
        })
        .option('amount', {
          alias: 'a',
          type: 'number',
          description: 'Amount',
          default: 0
        })
        .option('depth', {
          alias: 'd',
          type: 'number',
          description: 'How many blocks',
          default: undefined
        })
        .option('nonce', {
          alias: 'n',
          type: 'number',
          description: 'Nonce'
        })
        .option('privatekey', {
          alias: 'p',
          type: 'string',
          description: 'Privatekey'
        })
        .option('subaddress', {
          alias: 's',
          type: 'string',
          description: 'Subhchain Address'
        })
        .hide('version')
    },
    async (argv) => {
      const cwd = await process.cwd();
      const {
        stemrequest
      } = require('./src/dep');
      stemrequest(__dirname, cwd, argv).then(d => {
        console.log("Something:", d);
      })
      console.log(result);
      return Promise.resolve(result);
    },
  )
  .command('send', 'Send transaction over subchain network',
    (yargs) => {
      yargs
        .option('amount', {
          alias: 'a',
          type: 'number',
          description: 'tx value',
          demandOption: true,
        })
        .option('to', {
          alias: 't',
          type: 'string',
          description: 'tx to address',
          demandOption: true,
        })
        .option('op', {
          alias: 'o',
          type: 'number',
          description: 'tx operator',
          demandOption: true
        })
        .option('from', {
          alias: 'f',
          type: 'string',
          descript: 'Privatekey or (melt|roll|mint|self)',
          demandOption: true
        })
        .option('nonce', {
          alias: 'n',
          type: 'number',
          default: undefined
        })
        .option('stop', {
          alias: 's',
          type: 'boolean',
          default: false
        })
    },
    async (argv) => {
      const {
        send
      } = require('./src/send')
      console.log('run?');
      send(argv)
      // send(conf.subchain.self.private, argv.t, argv.a, true, conf.subchain.node);
    },
  )
  .command('adtx', 'Send transaction over mainchain',
    (yargs) => {
      yargs
        .option('from', {
          alias: 'f',
          type: 'string',
          description: 'From privateKey',
        })
        .option('to', {
          alias: 't',
          type: 'string',
          description: 'To',
        })
        .option('amount', {
          alias: 'a',
          type: 'number',
          description: 'Amount',
          default: 0
        })
        .option('payload', {
          alias: 'p',
          type: 'string',
          description: 'Payload',
          default: ""
        })
        .option('nonce', {
          alias: 'n',
          type: 'number',
          description: 'AccountNonce',
        })
        .option('price', {
          alias: 'g',
          type: 'number',
          description: 'GasPrice',
          default: 10
        })
        .option('limit', {
          alias: 'l',
          type: 'number',
          description: 'GasLimit',
          default: 200000
        })
        .option('time', {
          alias: 'i',
          type: 'number',
          description: 'Timestamp',
          default: 0
        })
        .option('depth', {
          alias: 'd',
          type: 'number',
          description: 'depth',
          default: 0
        })
        .option('stop', {
          alias: 's',
          type: 'boolean',
          description: 'don\'t send',
          default: false
        })
        .option('address', {
          type: 'string',
          description: 'From address to view basic info'
        })
    },
    async (argv) => {
      return new Promise(async function(resolve, reject) {
        try {
          const {
            adtx
          } = require('./src/dep')
          const result = adtx(argv)
          resolve(result);
        } catch (e) {
          reject(e)
        }
      });
    },
  )
  .command('keep', 'Maintain subchain (challenge & relay)',
    (yargs) => {
      yargs
      .option('crontab', {
        alias: 'c',
        type: 'boolean',
        description: 'true to add task; false to end task',
        default: 'false'
      })
    },
    async (argv) => {
      // const cwd = await process.cwd();
      const {
        keep
      } = require('./src/dep')
      keep(__dirname, argv.c)
    },
  )
  .command('challenge', 'Challenge block',
    (yargs) => {},
    (argv) => {},
  )
  .command('freeze', 'Freeze the subchain contract',
    (yargs) => {},
    (argv) => {},
  )
  .option('version', {
    alias: 'v',
    type: 'boolean',
    description: 'Show version'
  })
  .option('help', {
    alias: 'h',
    type: 'boolean',
    description: 'Show help'
  })
  .argv;


module.exports = anc
