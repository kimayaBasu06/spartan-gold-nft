const { Blockchain,Miner,Transaction,FakeNet } = require('spartan-gold');
const NftClient = require('./nft-client.js');
const NftBlock = require('./nft-block.js');
const EscrowClient = require('./escrow-client.js');

let fakeNet = new FakeNet();

// Artists, clients and miners
let alice = new NftClient({name: "Alice", net: fakeNet});
let minnie = new Miner({name: "Minnie", net: fakeNet});
let mickey = new Miner({name: "Mickey", net: fakeNet});
let storni = new NftClient({name: "Alfonsina Storni", net: fakeNet});

// Our faux "smart contract" -- an Escrow client.
let esCrow = new EscrowClient({name: "Slow Joe Crow", net:fakeNet});

// Creating genesis block
let genesis = Blockchain.makeGenesis({
  blockClass: NftBlock,
  transactionClass: Transaction,
  clientBalanceMap: new Map([
    [alice,500], [storni,500], [minnie,500], [mickey,500], [esCrow,500] 
  ]),
});

function showBalances(client) {
  console.log(`Alice:  ${client.lastBlock.balanceOf(alice.address)}`);
  console.log(`Minnie: ${client.lastBlock.balanceOf(minnie.address)}`);
  console.log(`Mickey: ${client.lastBlock.balanceOf(mickey.address)}`);
  console.log(`Storni: ${client.lastBlock.balanceOf(storni.address)}`);
  console.log(`esCrow: ${client.lastBlock.balanceOf(esCrow.address)}`);
}

console.log("Initial balances:");
showBalances(alice);

fakeNet.register(alice, minnie, mickey, storni, esCrow);

// Miners start mining.
minnie.initialize(); mickey.initialize();

// creating nfts for Storni and Alice
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

  alice.createNft({
    artistName: alice.name,  title: "Alice's nft",
    content: `
This is Alice's nft, this nft will
be transfered to storni when the code 
is finished running`,
  });
}, 1500);
// show initila nfts and who they belong to
setTimeout(() => {
  console.log();
  console.log("Showing NFTs for Storni:");
  storni.showNfts(storni.address);

  console.log();
  console.log("Showing NFTs for Alice:");
  alice.showNfts(alice.address);
  
  // storni's nft being bought by alice
  let nftID = storni.getNftIds()[0];
  console.log(`***Setting contract for NFT ${nftID}***`);
  esCrow.setContract([
    (tx) => tx.from === alice.address &&
            tx.outputs[0].amount === 150 &&
            tx.outputs[0].address === esCrow.address,
    (tx) => tx.from === storni.address &&
            tx.data !== undefined &&
            tx.data.receiver === esCrow.address &&
            tx.data.nftID === nftID
  ], () => {
    esCrow.postTransaction([{ amount: 150, address: storni.address }]);
    esCrow.transferNft(alice.address, nftID);
  });

  
}, 5000);

setTimeout(() => {
  console.log("***Storni and Alice complete their conditions.***");
  let nftID = storni.getNftIds()[0];
  alice.postTransaction([{ amount: 150, address: esCrow.address }]);
  storni.transferNft(esCrow.address, nftID);
}, 7000);

// alice's nft being bought by storni
setTimeout(() => {
  let nftID = alice.getNftIds()[0];
  console.log(`***Setting contract for NFT ${nftID}***`);
  esCrow.setContract([
    (tx) => tx.from === storni.address &&
            tx.outputs[0].amount === 150 &&
            tx.outputs[0].address === esCrow.address,
    (tx) => tx.from === alice.address &&
            tx.data !== undefined &&
            tx.data.receiver === esCrow.address &&
            tx.data.nftID === nftID
  ], () => {
    esCrow.postTransaction([{ amount: 150, address: alice.address }]);
    esCrow.transferNft(storni.address, );
  });
}, 10000);

setTimeout(() => {
  console.log();
  console.log("Showing NFTs for Storni:");
  storni.showNfts(storni.address);

  console.log();
  console.log("Showing NFTs for Alice:");
  alice.showNfts(alice.address);

let nftIDA = alice.getNftIds()[0];
  storni.postTransaction([{ amount: 150, address: esCrow.address }]);
  alice.transferNft(esCrow.address, nftIDA);
}, 10000);


setTimeout(() => {
  let nftID = alice.getNftIds()[0];
    storni.postTransaction([{ amount: 150, address: esCrow.address }]);
    alice.transferNft(esCrow.address, nftID);
}, 10000);

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
}, 30000);



