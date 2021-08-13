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
    this.postGenericTransaction({
      fee: 0,
      data: {
        type: NftBlock.TX_TYPE_NFT_CREATE,
        nft: nft,
      },
    });
  }

  createFundraiser({
      projectName,
      projectDescription,
      projectID,
      endDate,
      maxFunding,
      artistShare
  }) {
    this.postGenericTransaction({
      fee: 0,
      data: {
        type: NftBlock.TX_TYPE_NFT_FUNDRAISER_INIT,
        projectName,
        projectDescription,
        projectID,
        endDate,
        maxFunding,
        artistShare,
      }
    });
  }

  contributeFunds({ artistID, projectID, amount }) {
    this.postGenericTransaction({
      fee: 0,
      data: {
        type: NftBlock.TX_TYPE_NFT_FUNDRAISER_CONTRIB,
        artistID,
        projectID,
        amount,
      }
    });
  }

  sellNft() {
    this.log("Not implemented: sellNft");
  }

  transferNft(receiver, artName, title) {
    // Posting a transaction to transfer the NFT.
    this.postGenericTransaction({
      fee: 0,
      data: {
        type: NftBlock.TX_TYPE_NFT_TRANSFER,
        t: title,
        a: artName,
        r: receiver,
      },
    });
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