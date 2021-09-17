import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token, Token__factory } from "../typechain";

const TOKEN_NAME = "MyToken";
const TOKEN_SYMBOL = "MTK";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("MyToken", function () {
  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let Token: Token__factory;
  let token: Token;

  async function mintAndGetTokenId(
    url: string,
    minter: SignerWithAddress = owner
  ) {
    await token.connect(minter).mint(minter.address, url);

    const transfers = await token.queryFilter(
      token.filters.Transfer(null, minter.address)
    );

    return transfers[transfers.length - 1].args.tokenId;
  }

  this.beforeAll(async () => {
    // force await so gas reporter works
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
  });

  this.beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    Token = (await ethers.getContractFactory("Token")) as Token__factory;
    token = await Token.deploy(TOKEN_NAME, TOKEN_SYMBOL);
    await token.deployed();
  });

  describe("mint", () => {
    it("should mint an item and transfer to address", async function () {
      const receipt = token.mint(owner.address, "ipfs://foobar");

      await expect(receipt)
        .to.be.emit(token, "Transfer")
        .withArgs(ZERO_ADDRESS, owner.address, 1);
    });

    it("should store the provided URI and associate it to the tokenId", async function () {
      const tokenId = await mintAndGetTokenId("ipfs://foobar");

      expect(await token.tokenURI(tokenId)).to.eq("ipfs://foobar");
    });

    it("increments the tokenId after the first mint", async function () {
      let receipt = token.mint(owner.address, "ipfs://foobar");

      await expect(receipt)
        .to.be.emit(token, "Transfer")
        .withArgs(ZERO_ADDRESS, owner.address, 1);

      receipt = token.mint(owner.address, "ipfs://foobar");

      await expect(receipt)
        .to.be.emit(token, "Transfer")
        .withArgs(ZERO_ADDRESS, owner.address, 2);
    });
  });

  describe("burn/exists", () => {
    it("should burn a token if you own it", async function () {
      const tokenId = await mintAndGetTokenId("ipfs://foobar");

      await token.burn(tokenId);

      expect(await token.exists(tokenId)).to.be.false;
    });

    it("should not burn a token if you don't own it", async function () {
      const tokenId = await mintAndGetTokenId("ipfs://foobar", other);

      await expect(token.burn(tokenId)).to.be.revertedWith(
        "require you are not the owner of this token"
      );
      expect(await token.exists(tokenId)).to.be.true;
    });
  });

  describe("tokensOfOwner", () => {
    it("should list all of the owner's token", async () => {
      await mintAndGetTokenId("ipfs://foobar", other);
      const tokenId1 = await mintAndGetTokenId("ipfs://foobar");
      const tokenId2 = await mintAndGetTokenId("ipfs://foobar");

      expect(await token.tokensOfOwner(owner.address)).to.deep.equals([
        tokenId1,
        tokenId2,
      ]);
    });
  });
});
