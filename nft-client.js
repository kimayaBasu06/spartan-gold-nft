"use strict";

const { Miner } = require('spartan-gold');

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
    // Post a transaction creating a frundrasier.
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
    // posts a trasaction to contribute funds
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

  transferNft(receiver, nftID) {
    // Posting a transaction to transfer the NFT.
    this.postGenericTransaction({
      fee: 0,
      data: {
        type: NftBlock.TX_TYPE_NFT_TRANSFER,
        receiver: receiver,
        nftID: nftID
      },
    });
  }

  getNftIds() {
    return this.lastBlock.nftOwnerMap.get(this.address);
  }

  /**
   * Post a transaction transferring an NFT to a new owner.
   */
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