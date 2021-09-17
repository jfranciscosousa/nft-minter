import hre from "hardhat";
import { Token, Token__factory } from "../typechain";

const { TOKEN_NAME, TOKEN_SYMBOL } = process.env;

async function main() {
  const Token: Token__factory = (await hre.ethers.getContractFactory(
    "Token"
  )) as Token__factory;
  const token: Token = (await Token.deploy(
    TOKEN_NAME as string,
    TOKEN_SYMBOL as string
  )) as Token;

  await token.deployed();

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    await token.deployTransaction.wait(5);

    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [TOKEN_NAME, TOKEN_SYMBOL],
    });
  }

  console.log("Token deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
