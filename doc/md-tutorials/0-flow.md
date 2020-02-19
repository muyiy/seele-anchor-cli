# Creator

- [x] Install anchor

```bash
npm i seeleanchor
anc -v # --version
anc -h # --help
```

- [x] Initialize project

```bash
anc init -n mysubchain
# cd .subchain/mysubchain
```

- [ ] Configuration

```bash
# configure the conf.json
anc fill # Fill hashes
```

- [x] Compile & Deploy

```bash
anc make      # compile & creates config
anc make -c   # compile & creates config
anc make -d   # deploy
anc make -cd  # compile and deploy
```

- [ ] Start subchain node

```bash
# Use the config created with anc
./node start subchain -c nodeSubchain.json
```

- [ ] Control

```bash
anc freeze
anc unfreeze
```

# Speculating

- [ ] Link

```bash
anc link    # Verify node
anc link -w # Create config
```

- [ ] Show

```bash
anc show    # --user
anc show -u # --user
anc show -o # --operator
anc show -c # --creator
anc show -a # --all
```

# User

- [ ] Keys

```bash
anc keys -s 1 # --shard
```

- [ ] Trade

```bash
anc in  -o        # request verifier privilege
anc in  -s 100    # enter money or first time as normal user
anc in  -s 100 -o # enter and request verifier privilege
anc out -o        # cancel verifier privilege
anc out -s 100    # exit money, keeping privilege
anc out -s 100 -o # exit and cancel verifier privilege
```

- [ ] Transact

```bash
anc send --to 0x... --amount 100 # to and amount
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
