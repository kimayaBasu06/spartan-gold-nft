const {Blockchain,Miner,Transaction,FakeNet} = require('spartan-gold');
const NftClient = require('./nft-client.js');
const NftBlock = require('./nft-block.js');

let fakeNet = new FakeNet();

// Clients and miners
let alice = new NftClient({name: "Alice", net: fakeNet});
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});

// Artist creating an NFT
let storni = new NftClient({name: "Alfonsina Storni", net: fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: NftBlock,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [alice,233], [storni,500], [minnie,500], [mickey,500], 
  ]),
});

function showBalances(client) {
  console.log(`Alice:  ${client.lastBlock.balanceOf(alice.address)}`);
  console.log(`Minnie: ${client.lastBlock.balanceOf(minnie.address)}`);
  console.log(`Mickey: ${client.lastBlock.balanceOf(mickey.address)}`);
  console.log(`Storni: ${client.lastBlock.balanceOf(storni.address)}`);
}

console.log("Initial balances:");
showBalances(alice);

fakeNet.register(alice, minnie, mickey, storni);

// Miners start mining.
minnie.initialize(); mickey.initialize();

// Artist creates her NFT.
setTimeout(() => {
  console.log("***CREATING NFT***");
  storni.createNft({
    artistName: storni.name,  title: "Hombre pequeñito",
    content: `
Hombre pequeñito, hombre pequeñito,
Suelta a tu canario que quiere volar...
Yo soy el canario, hombre pequeñito,
déjame saltar.`,
  });
}, 2000);

setTimeout(() => {
  let nftID = storni.getNftIds()[0];
  console.log(`***Transferring NFT ${nftID}***`);
  storni.transferNft(alice.address, nftID);
}, 5000);

// Print out the final balances after it has been running for some time.
setTimeout(() => {
  console.log();
  console.log(`Minnie has a chain of length ${minnie.currentBlock.chainLength}:`);
  console.log("Final balances (Alice's perspective):");
  showBalances(alice);

  console.log();
  console.log("Showing NFTs for Storni:");
  storni.showNfts(storni.address);

  console.log();
  console.log("Showing NFTs for Alice:");
  alice.showNfts(alice.address);

  process.exit(0);
}, 10000);