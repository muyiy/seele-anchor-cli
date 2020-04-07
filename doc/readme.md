# Order of Demo


## `npm run test:init`

```bash
# Prepare anc
anc list -r testchain;    # Remove anc project
anc init -n testchain;    # Initiate anc project

# Prepare snc
snc init -o;   # Overwrite snc environment
snc kill;      # Clear running snc processes
snc clean;     # Clean all Seele databases
snc start;     # Start configured snc processes

# Deploy Subchain
anc fill;            # Fill hashes (from subchain)
snc kill;            # Clear running snc processes
anc make -c;         # Compile subchain project
snc start -m;        # Start snc main process
anc make -d;         # Deploy subchain project
anc show;            # Show deploy result
snc kill;            # Clear running snc processes
snc node version -m; # Show local mainchain node version
snc node version -s; # Show local subchain node version
```

## `npm run test:auto`

```bash
https://mochajs.org/#dynamically-generating-tests
```

## `npm run test:work`

```bash
get () {
  echo $(cat test/accounts.json | jq -r $1);
}

u4mp=$(get '.user[4].mainchain.private')
u4sa=$(get '.user[4].subchain.address_sle')

u5mp=$(get '.user[5].mainchain.private')
u5sp=$(get '.user[5].subchain.private')
u5sa=$(get '.user[5].subchain.address_sle')

u3mp=$(get '.user[3].mainchain.private')
u3sp=$(get '.user[3].subchain.private')
u3sa=$(get '.user[3].subchain.address_sle')

########################################
# 0th block
# execute
anc keep

########################################
# 1st Block:
# add operator
anc trade in -o true -a 11 -p $u4mp -s $u4sa
# add user
anc trade in -o false -a 10 -p $u5mp -s $u5sa
# Relay
anc keep

########################################
# 2nd Block
# operator transaction
anc send -f -t -a
# user transaction
anc send -f -t -a
# Relay & ex
anc keep

########################################
# 3rd Block
# out Operator
anc trade out -o true -p $u4mp -s $u4sa
# out user
anc trade out -o false -p $u5mp -s $u5sa
# relay and execute
anc keep

########################################
anc keep

```
