const hre = require("hardhat");

async function main() {
  const celoTrivia = await hre.ethers.getContractFactory("CeloTriviaV3");
  const CeloTrivia = await celoTrivia.deploy(
    "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
  );

  await CeloTrivia.deployed();

  console.log(`CeloTrivia deployed`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
