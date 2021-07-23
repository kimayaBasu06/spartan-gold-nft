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
    this.log("   Not yet implemented...");

    let data = {
      nft: nft,
      type: NftBlock.TX_TYPE_NFT_CREATE,
    }
 
    transferNft(nft) {
    this.log("   Not yet implemented...");

    let data = {
      nft: nft,
      type: NftBlock.TX_TYPE_NFT_TRANSFER,
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

  /**
   * Post a transaction transferring an NFT to a new owner.
   */
  transferNft() {
    this.log("   Not yet implemented...");
  }

  showNfts() {
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
