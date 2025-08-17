const hre = require("hardhat");

async function main() {
  const TodoList = await hre.ethers.getContractFactory("TodoList");
  const todo = await TodoList.deploy();

  await todo.waitForDeployment();               // <- antes: await todo.deployed()
  const addr = await todo.getAddress();         // <- o: const addr = todo.target

  console.log("TodoList deployed to:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
