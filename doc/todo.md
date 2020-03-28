# PLAN

### nice

- 0x95151951ad18ca0f7c57dfd3fc8e9befafab2383d4993496e9bda3059969adb1
  - 0xf78398d5233df23b414f6315e8652025df0c0471
  - "subchain": {

      "address": "0x3443917387AD599595f2895fef20afaC7fc6AaDF",
      "private": "0xdcaa137ba4cc5138d45d00d2cb29dac456932aa66ac3ccdf06374a23d5e93852"
    },


### controller
  - Initialize
    - [x] keys: generate subchain and mainNet key pairs
      - stemsdk: generate keypairs
    - [x] init: initiate config and solidity
    - [ ] fill: fill the hashes before deploy
      - call node api
    - [x] make: compile and deploy
    - [ ] show: shows information from both node and contract
      - show -d //download config
      - User panel: contract and subchain
      - Operator panel: contract and subchain
      - Creator panel: contract and subchain
  - Utilize
    - [ ] freeze: freeze subchain //small
    - [ ] unfreeze: unfreeze subchain //small
    - [ ] keep: maintain
      - logic flow?
    - [ ] send: send transactions on subchain
      - stemsdk:
      - go-seele:
    - [ ] in/out: trade in subchain token
      -
    - [ ] challenge: challenge relay
      - logic flow?

### now
- basic user flow
  - deploy!
  - subscribe!
  - show!

### done

### nope
