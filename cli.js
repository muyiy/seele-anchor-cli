#!/usr/bin/env node
const {conf, getAbi, read, getConf, bftConf} = require('./src/conf');
const {fillHashes, stemrequest, adtx, keep} = require('./src/dep')
const {send} = require('./src/send')
const call = require('./src/call')
const {init, ContractBase} = require('seele-contract-core');
const stem = require('seele-stemsdk-javascript');
const seele = require('seele-sdk-javascript');
const term = require( 'terminal-kit' ).terminal;
const cwd = process.cwd();

'use strict';
require('yargs') // eslint-disable-line
    .command('init', 'Initiate subchain project',
        (yargs) => {
          yargs
              .option('name', {
                alias: 'n',
                type: 'string',
                description: 'subchain project name',
                demandOption: true,
              })
              .hide('version');
        },
        async (argv) => {
          // console.log(argv);
          const cwd = await process.cwd();
          const dir = '.subchain';
          init(cwd, dir, argv.n).then((a)=>{
            conf(cwd, dir, argv.n);
          });
        },
    )
    .command('keys', 'Generate the keys',
        (yargs) => {
          yargs
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
          const stmkey = stem.key.spawn();
          const slekey = seele.key.spawn(argv.s);
          const obj = {
            subchain: {
              address: stmkey.address,
              private: stmkey.privateKey
            },
            mainchain: {
              shard: argv.s,
              address: slekey.address,
              private: slekey.privateKey
            }
          }
          console.log(JSON.stringify(obj,null,2));
        },
    )
    .command('fill', 'Fill hashes for Subhchain',
      (yargs) => {},
      async (argv) => {
        // var rpc = new seele.rpc('http://localhost:8037')
        // var result = await rpc.sbGen("0xe2b99c9e86ebe7b087ede32b2cca3a4b3ee10032,0xe2b99c9e86ebe7b087ede32b2cca3a4b3ee10032","100,100")
        // var result = await rpc.getInfo()
        const cwd = await process.cwd();
        await fillHashes(cwd);
        // console.log(result);
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
          const cwd = await process.cwd();
          const contract = new ContractBase(cwd);
          if (argv.c && !argv.d) {
            contract.compile();
          } else if (!argv.c && argv.d) {
            contract.deploy();
          } else if (argv.c && argv.d) {
            new Promise((resolve, reject)=>{
              resolve('');
            })
                .then((d)=>{
                  return contract.compile();
                })
                .then((d)=>{
                  return contract.deploy();
                })
                .catch((e)=>{
                  console.log(e);
                });
          } else {
            console.log('Option missing: either c or d');
          }
        },
    )
    .command('show', 'Show subchain information (panel & lookup)',
        (yargs) => {
          yargs
              .command('generate', 'Generates subchain config file from contract',
                  (yargs)=>{},
                  (argv)=>{
                    console.log(argv);
                    console.log('download config file from contract!');
                  },
              )
              .option('user',{
                alias: 'u',
                type: 'boolean',
                description: 'User panel',
                default: true
              })
              .option('creator',{
                alias: 'c',
                type: 'boolean',
                description: 'Creator panel',
                default: false
              })
              .option('operator',{
                alias: 'o',
                type: 'boolean',
                description: 'Operator panel',
                default: false
              })
              .option('all',{
                alias: 'a',
                type: 'boolean',
                description: 'All panels',
                default: false
              })
              .option('verbose',{
                alias: 'b',
                type: 'boolean',
                description: 'More details',
                default: false
              })
              .hide('version');
        },
        async (argv) => {
          const cwd = await process.cwd();
          var config = await getConf(cwd);
          const address = config.addressBook['StemRootchain.sol'];
          var abi = await getAbi(__dirname);
          var subchain = new seele.contract(address,abi);
          if (argv.e) {
            console.log('make config');
            const cwd = await process.cwd();
            bftConf(__dirname, cwd);
          }

          var stat = await call.status(__dirname, cwd)

          term
          .green('Address:\n')
          console.log(address);

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
        },
    )
    .command('look', 'Look up information',
      (yargs)=>{
        yargs
        .command('bal', 'Account Balance',
          (yargs)=>{
            yargs
            .option('account', {alias: 'a', type: 'string'})
            .option('list', {alias: 'l', type: 'boolean'})
          },
          async (argv)=>{
            if (argv.list) {
              call.allAccounts(__dirname, cwd)
            }

            if (argv.a == undefined) {

              var cnf = await getConf(cwd)
              // console.log(cnf.subchain.self.address);

            } else {
              // console.log(argv.a);
            }
          }
        )
      },
      async (argv) => {}
    )
    .command('trade', 'Trade (in/out/fee/undo)',
        (yargs) => {
          yargs
          .command('in', 'Trade in', (yargs)=>{}, async (argv)=>{
            const cwd = await process.cwd();
            stemrequest(__dirname, cwd, argv);
          })
          .command('out', 'Trade out', (yargs)=>{}, async (argv)=>{
            const cwd = await process.cwd();
            stemrequest(__dirname, cwd, argv);
          })
          .command('fee', 'Export fee', (yargs)=>{}, async (argv)=>{
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
            default: 1
          })
          .option('nonce', {
            alias: 'n',
            type: 'number',
            description: 'Nonce'
          })
          .hide('version')
        },
        async (argv) => {
          const cwd = await process.cwd();
          stemrequest(__dirname, cwd, argv);
        },
    )
    .command('send', 'Send transaction over subchain network',
        (yargs) => {
          yargs
              .command('mint', 'send from mint account',
                (yargs)=>{
                  yargs
                  .option('amount',{
                    alias: 'a',
                    type: 'number',
                    description: 'tx value',
                    demandOption: true,
                  })
                  .option('to',{
                    alias: 't',
                    type: 'string',
                    description: 'tx va',
                    demandOption: true,
                  })
                  .option('operator',{
                    alias: 'o',
                    type: 'boolean',
                    description: 'operator related',
                    demandOption: false,
                    default: false
                  })
                },
                async (argv)=>{
                  const cwd = await process.cwd();
                  const conf = await getConf(cwd);
                  send(conf.subchain.mint.private, argv.t, argv.a, argv.o, conf.subhchain.node);
                }
              )
              .command('melt', 'send from melt account',
                (yargs)=>{
                  yargs
                  .option('amount',{
                    alias: 'a',
                    type: 'number',
                    description: 'tx value',
                    demandOption: true,
                  })
                  .option('to',{
                    alias: 't',
                    type: 'string',
                    description: 'tx va',
                    demandOption: true,
                  })
                  .option('operator',{
                    alias: 'o',
                    type: 'boolean',
                    description: 'operator related',
                    demandOption: false,
                    default: false
                  })
                },
                async (argv)=>{
                  const cwd = await process.cwd();
                  const conf = await getConf(cwd);
                  send(conf.subchain.melt.private, argv.t, argv.a, argv.o, conf.subhchain.node);
                }
              )
              .command('roll', 'send from roll account',
                (yargs)=>{
                  yargs
                  .option('amount',{
                    alias: 'a',
                    type: 'number',
                    description: 'tx value',
                    demandOption: true,
                  })
                  .option('to',{
                    alias: 't',
                    type: 'string',
                    description: 'tx va',
                    demandOption: true,
                  })
                },
                async (argv)=>{
                  const cwd = await process.cwd();
                  const conf = await getConf(cwd);
                  send(conf.subchain.roll.private, argv.t, argv.a, false, conf.subhchain.node);
                }
              )
              .option('amount',{
                alias: 'a',
                type: 'number',
                description: 'tx value',
                demandOption: true,
              })
              .option('to',{
                alias: 't',
                type: 'string',
                description: 'tx va',
                demandOption: true,
              })
        },
        async (argv) => {
          const cwd = await process.cwd();
          const conf = await getConf(cwd);
          send(conf.subchain.self.private, argv.t, argv.a, true, conf.subchain.node);
        },
    )
    .command('adtx', 'Send transaction over mainchain',
        (yargs) => {
          yargs
          .option('from',{
            alias: 'f',
            type: 'string',
            description: 'From privateKey',
          })
          .option('to',{
            alias: 't',
            type: 'string',
            description: 'To',
          })
          .option('amount',{
            alias: 'a',
            type: 'number',
            description: 'Amount',
            default: 0
          })
          .option('payload',{
            alias: 'p',
            type: 'string',
            description: 'Payload',
            default: ""
          })
          .option('nonce',{
            alias: 'n',
            type: 'number',
            description: 'AccountNonce',
          })
          .option('price',{
            alias: 'g',
            type: 'number',
            description: 'GasPrice',
            default: 10
          })
          .option('limit',{
            alias: 'l',
            type: 'number',
            description: 'GasLimit',
            default: 200000
          })
          .option('time',{
            alias: 'i',
            type: 'number',
            description: 'Timestamp',
            default: 0
          })
          .option('depth',{
            alias: 'd',
            type: 'number',
            description: 'depth',
            default: 0
          })
          .option('stop',{
            alias: 's',
            type: 'boolean',
            description: 'don\'t send',
            default: false
          })
        },
        async (argv) => {
          const cwd = await process.cwd();
          adtx(cwd, argv)
        },
    )
    .command('keep', 'Maintain subchain (challenge & relay)',
        (yargs) => {},
        async (argv) => {
          const cwd = await process.cwd();
          keep(__dirname, cwd)
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
    .option('version', {alias: 'v', type: 'boolean', description: 'Show version'})
    .option('help', {alias: 'h', type: 'boolean', description: 'Show help'})
    .argv;
