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

- [User guide](https://seeletech.gitbook.io/wiki/developer/subchain/seele-anchor-cli/0-user)
- [Developer guide](https://seeletech.gitbook.io/wiki/developer/subchain/seele-anchor-cli/1-test)
