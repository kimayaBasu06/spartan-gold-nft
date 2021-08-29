"use strict";

const { Blockchain, Block, Client, Miner, Transaction, FakeNet } = require('spartan-gold');

let fakeNet = new FakeNet();

// Clients
let alice = new Client({name: "Alice", net: fakeNet});
let minnie = new Miner({name: "Minnie", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: Block, transactionClass: Transaction,
  clientBalanceMap: new Map([
    [alice, 233],
    [minnie, 500],
  ]),
});

function showBalances(client) {
  console.log(`Alice: ${client.lastBlock.balanceOf(alice.address)}`);
  console.log(`Minnie: ${client.lastBlock.balanceOf(minnie.address)}`);
}

// Showing initial funds.
showBalances(alice);

fakeNet.register(alice, minnie);

// Minnie start mining.
minnie.initialize();

// Alice transfers some money to Minnie.
console.log(`Alice is transferring 40 gold to ${minnie.address}`);
alice.postTransaction([{ amount: 40, address: minnie.address }]);

// Print out the final balances after it has been running for some time.
setTimeout(() => {
  console.log();
  console.log(`Chain length: ${minnie.currentBlock.chainLength}`);

  console.log();
  console.log("Final balances (Alice's perspective):");
  showBalances(alice);

  process.exit(0);
}, 2000);
