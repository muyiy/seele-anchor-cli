#!/usr/bin/env bash

# remove, and initiate subchain
anc list -r testchain;
anc init -n testchain;

# view available subchains
snc init -o;
snc kill;
snc clean;
snc start;

# fill hashes, compile & deploy subchain, view subchain
anc fill;
snc kill;
anc make -c;
snc start -m;
anc make -d;
anc show;
snc kill;
snc node version -m;
snc node version -s;
