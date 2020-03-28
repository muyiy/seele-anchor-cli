#!/usr/bin/env bash


# echo $self_main_pri


##########################
# Fill main Accounts
# snc start -m;
# self_main_pri=$(cat test/accounts.json | jq -r '.self.mainchain.private');
# use0_main_pub=$(cat test/accounts.json | jq -r '.user[0].mainchain.address_sle');
# use1_main_pub=$(cat test/accounts.json | jq -r '.user[1].mainchain.address_sle');
# use2_main_pub=$(cat test/accounts.json | jq -r '.user[2].mainchain.address_sle');
# use3_main_pub=$(cat test/accounts.json | jq -r '.user[3].mainchain.address_sle');
# use4_main_pub=$(cat test/accounts.json | jq -r '.user[4].mainchain.address_sle');
# use5_main_pub=$(cat test/accounts.json | jq -r '.user[5].mainchain.address_sle');
# anc adtx -f $self_main_pri -t $use0_main_pub -a 600000000;
# anc adtx -f $self_main_pri -t $use1_main_pub -a 600000000;
# anc adtx -f $self_main_pri -t $use2_main_pub -a 600000000;
# anc adtx -f $self_main_pri -t $use3_main_pub -a 600000000;
# anc adtx -f $self_main_pri -t $use4_main_pub -a 600000000;
# anc adtx -f $self_main_pri -t $use5_main_pub -a 600000000;
# anc main account -a $use0_main_pub
# anc main account -a $use1_main_pub
# anc main account -a $use2_main_pub
# anc main account -a $use3_main_pub
# anc main account -a $use4_main_pub
# anc main account -a $use5_main_pub

##########################
# Trading in and out
snc start -m;
self_stem_pub=$(cat test/accounts.json | jq -r '.self.subchain.address_sle');
self_main_pri=$(cat test/accounts.json | jq -r '.self.mainchain.private');
self_main_pub=$(cat test/accounts.json | jq -r '.self.mainchain.address_sle');
use3_main_pub=$(cat test/accounts.json | jq -r '.user[3].mainchain.address_sle');
use4_main_pub=$(cat test/accounts.json | jq -r '.user[4].mainchain.address_sle');
use3_main_pri=$(cat test/accounts.json | jq -r '.user[3].mainchain.private');
use4_main_pri=$(cat test/accounts.json | jq -r '.user[4].mainchain.private');
use0_main_pri=$(cat test/accounts.json | jq -r '.user[0].mainchain.private');
use3_stem_pub=$(cat test/accounts.json | jq -r '.user[3].subchain.address_sle');
use4_stem_pub=$(cat test/accounts.json | jq -r '.user[4].subchain.address_sle');
use0_stem_pub=$(cat test/accounts.json | jq -r '.user[0].subchain.address_sle');
use0_main_pub=$(cat test/accounts.json | jq -r '.user[0].mainchain.address_sle');
use1_main_pri=$(cat test/accounts.json | jq -r '.user[1].mainchain.private');
use1_stem_pub=$(cat test/accounts.json | jq -r '.user[1].subchain.address_sle');
anc main account -a $use3_main_pub
anc main account -a $use4_main_pub
anc main account -a $self_main_pub
# anc trade in -o true -a 99 -p $use3_main_pri -s $use3_stem_pub
# anc trade in -o false -a 89 -p $use4_main_pri -s $use4_stem_pub
anc trade out -o true -p $self_main_pri -s $use0_stem_pub
anc show


##########################
# Send
# snc start -s
# self_stem_pri=$(cat test/accounts.json | jq -r '.self.subchain.private');
# self_stem_pub=$(cat test/accounts.json | jq -r '.self.subchain.address_sle');
# mint_stem_pub=$(cat test/accounts.json | jq -r '.mint.subchain.address_sle');
# use0_stem_pub=$(cat test/accounts.json | jq -r '.user[0].subchain.address_sle');
# use1_stem_pub=$(cat test/accounts.json | jq -r '.user[1].subchain.address_sle');
# use2_stem_pub=$(cat test/accounts.json | jq -r '.user[2].subchain.address_sle');
# anc send -f $self_stem_pri -t $use0_stem_pub -a 100 -o 1
# anc send -f $self_stem_pri -t $use1_stem_pub -a 100 -o 1
# anc send -f $self_stem_pri -t $use2_stem_pub -a 100 -o 1
# anc stem account -a $mint_stem_pub
# anc stem account -a $self_stem_pub
# # echo $self_stem_pub
# anc stem account -a $use0_stem_pub
# anc stem account -a $use1_stem_pub
# anc stem account -a $use2_stem_pub


##########################
# Relay
snc start
# anc keep

##########################
# Relay
# anc keep

##########################
# Done
snc kill
