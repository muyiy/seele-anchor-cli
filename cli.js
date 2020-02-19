#!/usr/bin/env node
const {conf, link} = require('./src/conf');
const {init, ContractBase} = require('seele-contract-core');

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
    .command('make', 'Deploy subchain contracts',
        (yargs) => {
          yargs
              .option('compile', {
                alias: 'c',
                type: 'boolean',
                description: 'Compile to bytecode',
                default: true,
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
    .command('show', 'Show subchain information',
        (yargs) => {
            yargs
            .command('generate', 'Generates subchain config file from contract',
                (yargs)=>{},
                (argv)=>{
                  console.log(argv);
                  console.log('download config file from contract!');
                }
            )
            .hide('version')
        },
        (argv) => {
          console.log(argv);
        },
    )
    .command('fill', 'Fill hashes for Subhchain',
        (yargs) => {},
        (argv) => {},
    )
    .command('freeze', 'Freeze the subchain contract',
        (yargs) => {},
        (argv) => {},
    )
    .command('unfreeze', 'Unfreeze the subchain contract',
        (yargs) => {},
        (argv) => {},
    )
    .command('keys', 'Generate the keys',
        (yargs) => {},
        (argv) => {},
    )
    .command('send', 'Send transaction over subchain network',
        (yargs) => {},
        (argv) => {},
    )
    .command('keep', 'Maintain subchain',
        (yargs) => {},
        (argv) => {},
    )
    .command('in', 'Trade in',
        (yargs) => {},
        (argv) => {},
    )
    .command('out', 'Trade out',
        (yargs) => {},
        (argv) => {},
    )
    .command('Challenge', 'Challenge block',
        (yargs) => {},
        (argv) => {},
    )
    .option('version', {alias: 'v', type: 'boolean', description: 'Show version'})
    .option('help', {alias: 'h', type: 'boolean', description: 'Show help'})
    .argv;
