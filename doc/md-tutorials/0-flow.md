# Create

- [x] Install

```bash
npm i seeleanchor
anc -v # --version
anc -h # --help
```

- [x] Using

```bash
# 1. Initiate project
anc init -n mysubchain
cd .subchain/mysubchain
# 2. Enter the deposit amounts
# 3. Call to fill the hashes
anc fill      # Fill hashes
# 4. Compile & Deploy & export
anc make -cd  # compile and deploy
anc show -e
# 5. Start node
./node start subchain -c bft.json
```



# Speculating

- [ ] Show

```bash
anc show    # --user
anc show -u # --user
anc show -o # --operator
anc show -c # --creator
anc show -a # --all
```

# User

- [x] Keys

```bash
anc keys -s 1 # --shard
```

- [ ] Transact

```bash
anc send --to 0x... --amount 100 # to and amount
```

- [ ] Trade

```bash
anc trade in  -a 100     # enter money and
anc trade in  -a 100 -o  # enter and request verifier privilege
anc trade out -a 100     # exit money, keeping privilege
anc trade out -o         # cancel verifier privilege, refund all
anc trade fee -a 100     # get all
anc trade                # show current status
anc trade out            # early exits
```

- [ ] Challenge

```bash
anc challenge --bond
```

# Verifier

- [ ] Maintain

```bash
# config maintain info in conf.json
anc keep
anc keep -p # push task to crontab
anc keep -d # drop task from crontab
```

# Creator

- [ ] Control

```bash
anc freeze
# anc unfreeze
```

$$\int_\Omega \nabla u \cdot \nabla v~dx = \int_\Omega fv~dx$$
