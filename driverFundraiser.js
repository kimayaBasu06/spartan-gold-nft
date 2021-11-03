"use strict";

const { Blockchain, Client, Miner, Transaction, FakeNet } = require('spartan-gold');

const NftClient = require('./nft-client.js');
const NftBlock = require('./nft-block.js');

const FUND_DURATION = 60000;

console.log("Starting simulation.  This may take a moment...");


let fakeNet = new FakeNet();

// Clients
let alice = new NftClient({name: "Alice", net: fakeNet});
let bob = new NftClient({name: "Bob", net: fakeNet});
let charlie = new NftClient({name: "Charlie", net: fakeNet});

// Miners
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Artist creating an NFT
let storni = new NftClient({name: "Alfonsina Storni", net: fakeNet});
let gracie = new NftClient({name: "Grace Marie", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: NftBlock,
  transactionClass: Transaction,
  powLeadingZeroes: 13,
  clientBalanceMap: new Map([
    [alice, 233],
    [bob, 99],
    [charlie, 67],
    [storni, 500],
    [gracie, 300],
    [minnie, 500],
    [mickey, 500],
  ]),
});

function showBalances(client) {
  console.log(`Alice has ${client.lastBlock.balanceOf(alice.address)} gold.`);
  console.log(`Bob has ${client.lastBlock.balanceOf(bob.address)} gold.`);
  console.log(`Charlie has ${client.lastBlock.balanceOf(charlie.address)} gold.`);
  console.log(`Minnie has ${client.lastBlock.balanceOf(minnie.address)} gold.`);
  console.log(`Mickey has ${client.lastBlock.balanceOf(mickey.address)} gold.`);
}

// Showing the initial balances from Alice's perspective, for no particular reason.
console.log("Initial balances:");
showBalances(alice);
fakeNet.register(alice, bob, charlie, minnie, mickey, storni, gracie);
// Miners start mining.
minnie.initialize();
mickey.initialize();

// Artist begins a new fundraising campaign.
setTimeout(() => {
  console.log();
  console.log("***STARTING NEW FUNDRAISER***");
  console.log();
  storni.createFundraiser({
    projectName: "Un poema de amor",
    projectDescription: "Probablemente pienses que este canción es sobre ti, ¿no es así?",
    projectID: "1",
    endDate: Date.now() + FUND_DURATION,
    maxFunding: "25",
    artistShare: "0.20",
  });
}, 2000);

// Backers donate to fundraiser
setTimeout(() => {
  console.log();
  console.log("***LIST FUNDRAISERS***");
  minnie.currentBlock.listFundraisers();
  console.log();
  console.log("***CONTRIBUTING TO FUNDRAISER***");
  console.log();
  charlie.contributeFunds({
    artistID: storni.address,
    projectID: "1",
    amount: 12,
  });
}, 5000);

// setTimeout(() => {
//   console.log();
//   console.log("***SELL NFT***");
//   console.log();
//   storni.sellNft({
//     buyerID: gracie.address,
//     nftID: "FIXME",
//     offerExpiration: Date.now + FUND_DURATION,
//     amount: 500,
//   });
// }, 14000);

// Print out the final balances after it has been running for some time.
setTimeout(() => {
  console.log();
  console.log("Showing NFTs for Storni:");
  storni.showNfts(storni.address);

  console.log();
  console.log("Showing NFTs for Gracie:");
  gracie.showNfts(gracie.address);

  minnie.currentBlock.listFundraisers();

  process.exit(0);
}, 19000);
