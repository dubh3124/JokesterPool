const main = async () => {

    function calculateAverage(array) {
      var total = 0;
      var count = 0;

      array.forEach(function(item, index) {
          total += item.toNumber();
          count++;
      });

      return total / count;
    }
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const jokesterContractFactory = await hre.ethers.getContractFactory('JokesterPool');
    const jokesterContract = await jokesterContractFactory.deploy({
      value: hre.ethers.utils.parseEther('0.1'),
    });
    await jokesterContract.deployed();
    console.log("Contract deployed to:", jokesterContract.address);

    
    console.log("Contract deployed by:", owner.address);

    /*
    * Get Contract balance
    */
    let contractBalance = await hre.ethers.provider.getBalance(
      jokesterContract.address
    );
    console.log(
      'Contract balance:',
      hre.ethers.utils.formatEther(contractBalance)
    );

    let joke;
    // jokes = await jokesterContract.getJokes();
    // console.log(jokes)
    
    let jokesterTxn = await jokesterContract.addJoke("How do you follow Will Smith in the snow? You follow the fresh prints!");
    await jokesterTxn.wait();

    let jokester1Txn = await jokesterContract.addJoke("How do you follow Will Smith in the snow? Ythe fresh prints!");
    await jokester1Txn.wait();

    /*
    * Get Contract balance to see what happened!
    */
    contractBalance = await hre.ethers.provider.getBalance(jokesterContract.address);
    console.log(
      'Contract balance:',
      hre.ethers.utils.formatEther(contractBalance)
    );
      

    jokeids = await jokesterContract.getJokeIDs();
    console.log(jokeids)

    joke = await jokesterContract.getJoke(jokeids[0]);

    await jokesterContract.rateJoke(jokeids[0], 5)
    await jokesterContract.rateJoke(jokeids[0], 2)
    await jokesterContract.rateJoke(jokeids[0], 3)
    await jokesterContract.rateJoke(jokeids[0], 3)
    await jokesterContract.rateJoke(jokeids[0], 1)
    await jokesterContract.rateJoke(jokeids[0], 4)
    await jokesterContract.rateJoke(jokeids[0], 2)
    await jokesterContract.rateJoke(jokeids[0], 5)
    await jokesterContract.rateJoke(jokeids[0], 4)

    joke = await jokesterContract.getJoke(jokeids[0]);

    console.log(joke["author"], joke["joke"], calculateAverage(joke["ratings"]), Date(joke["timestamp"].toNumber()))



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