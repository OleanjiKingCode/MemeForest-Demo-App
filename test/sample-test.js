const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });

  it("Should create two members,ceate two means,like one,star one,fetch all, fetch starred and fetch mine " , async function () {
    const Meme = await ethers.getContractFactory("MemeForest");
    const meme = await Meme.deploy();
    await meme.deployed();
    
    let today = new Date().toISOString().slice(0, 10);
    console.log(today)
    const [_, buyerAddress,thirdone] = await ethers.getSigners()
    const createMember = await meme.connect(buyerAddress).CreateMembers("first kid", today);
    const fetchMembers= await meme.connect(buyerAddress).fetchMembers();
    console.log(fetchMembers);
    const addr =  await buyerAddress.getAddress()
    const addr2 =  await thirdone.getAddress()
    const fectme = await meme.GetMemberByAddr(addr);
    console.log(fectme);
    let another = new Date().toISOString().slice(0, 10);
    await meme.connect(buyerAddress).CreateMemeItems("meme1",addr,"filememe1",another,"this is the first meme");
    await meme.connect(thirdone).CreateMemeItems("meme2",addr2,"filememe2",another,"hungry man meme");

    const Allmeme = await meme.fetchAllMemes()
    console.log(Allmeme)

    console.log("liking meme")
    await meme.connect(thirdone).LikeMeme("1");

    console.log("staring meme")
    await meme.connect(buyerAddress).StarMeme("2", addr);


    console.log("fetching starred memes right now...............")
    const FetchStarredMemes = await meme.connect(buyerAddress).fetchMyStarredMemes();

    console.log(FetchStarredMemes)
    console.log("fetching starred memes right now...............")

    console.log("fetching my meme")
    const first = await meme.connect(buyerAddress).fetchMyMeme()
    console.log(first)
    console.log("fetching my second meme")
    const second = await meme.connect(thirdone).fetchMyMeme()
    console.log(second)

  });
 

  

});
