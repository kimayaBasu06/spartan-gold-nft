"use strict";

const { Blockchain, Miner } = require('spartan-gold');

const NftBlock = require('./nft-block');

// Extending miner instead of client, since it avoids problems
// in implementing TcpMiner.
module.exports = class NftClient extends Miner {

  /**
   * Post a transaction creating a new NFT owned by the client.
   */
  createNft(nft) {
    let data = {
      nft: nft,
      type: NftBlock.TX_TYPE_NFT_CREATE,
    }
 
    // Posting a transaction to create the NFT.
    let tx = Blockchain.makeTransaction({
      from: this.address,
      nonce: this.nonce,
      pubKey: this.keyPair.public,
      data: data,
      fee: 0,
    });
  
    tx.sign(this.keyPair.private);
    
    // Adding transaction to pending.
    this.pendingOutgoingTransactions.set(tx.id, tx);

    this.nonce++;

    this.net.broadcast(Blockchain.POST_TRANSACTION, tx);
  }

  transferNft(receiver, artName, title) {
    //this.log("   Not yet implemented...");

    let data = {
      type: NftBlock.TX_TYPE_NFT_TRANSFER,
      t: title,
      a: artName,
      r: receiver,
    }
    
    // Posting a transaction to transfer the NFT.
    let tx = Blockchain.makeTransaction({
      from: this.address,
      nonce: this.nonce,
      pubKey: this.keyPair.public,
      data: data,
      fee: 0,
    });
    console.log();
    tx.sign(this.keyPair.private);
    console.log();
    // Adding transaction to pending.
    this.pendingOutgoingTransactions.set(tx.id, tx);
    console.log();
    this.nonce++;

    this.net.broadcast(Blockchain.POST_TRANSACTION, tx);
  }


  postTransaction(TsmartContract) {
    //this.log("   Not yet implemented...");
    console.log("THIS IS THE SMART CONTRACT???");
    console.log(TsmartContract)
  }

  /**
   * Post a transaction transferring an NFT to a new owner.
   */
  showNfts() {
    console.log("Showing NFTs: ");
    console.log();
    let nftList = this.lastBlock.getOwnersNftList(this.address);
    nftList.forEach(nftID => {
      let nft = this.lastBlock.getNft(nftID);
      console.log(`
      ${nft.artistName}'s "${nft.title}"
      ------------------------------------
      ${nft.content}
      `);
      console.log();
    });
  }
}
