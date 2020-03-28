# seele-anchor-cli

What it can do:
- Mainchain network:
    - configure, compile and deploy subchain contract
    - monitor, trade with, and control subchain contract
    - limited mainchain apis: transactions, node_info, account_info, etc
    - maintain: automatically relay block information from subchain network
- Subchain network:
    - limited mainchain apis: transactions, node_info, account_info, etc
    - maintain: automatically execute transaction requests from subchain contract on maintain network
- Simple mainchain & subchain private simulation environment

What it can't (or shouldn't) do:
- Maintain offical mainchain network node
- Maintain offical subchain network node


# Install

```bash
npm i -g seele-anchor-cli
anc -v # --version: Show version
anc -h # --help: Show help
```

# Resource

- [User guide](./doc/md-tutorials/0-user.md)
- [Developer guide](./doc/md-tutorials/1-test.md)
