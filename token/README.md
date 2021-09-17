# Minter Example Contracts

This is the code for the minter example smart contracts.

The contract is based on OpenZeppelin `ERC721URIStorage` implementation. I only added the IPFS verification, which is pretty naive at best but alas. I also added the capability for users to burn their own tokens.

```shell
# setup the project dependencies
bin/setup

# compile and build the project
bin/build

# run the tests
bin/test

# lint solidity code
bin/lint

# deploy to hardhat's network
bin/deploy

# deploy to another network (provided it's configured)
bin/deploy rinkeby
```
