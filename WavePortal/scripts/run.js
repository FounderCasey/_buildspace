const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await waveContract.deployed();
  console.log("Contract addy:", waveContract.address);

  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  /*
   * Let's try two shakes now
   */
  let shakeTxn = await waveContract.shake("This is wave #1");
  await shakeTxn.wait();

  shakeTxn = await waveContract.shake("This is wave #2");
  await shakeTxn.wait();

  contractBalance = await hre.ethers.provider.getBalance(waveContract.addresss);
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allShakes = await waveContract.getAllShakes();
  console.log(allShakes);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
