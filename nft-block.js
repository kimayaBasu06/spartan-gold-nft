"use strict";

const { Block, utils } = require('../spartan-gold');

const TX_TYPE_NFT_CREATE = "NFT_CREATE";
const TX_TYPE_NFT_TRANSFER = "NFT_TRANSFER";

module.exports = class NftBlock extends Block {

  static get TX_TYPE_NFT_CREATE() { return TX_TYPE_NFT_CREATE; }
  static get TX_TYPE_NFT_TRANSFER() { return TX_TYPE_NFT_TRANSFER; }

  constructor(rewardAddr, prevBlock, target, coinbaseReward) {
    super(rewardAddr, prevBlock, target, coinbaseReward);

    // Tracking NFTs
    this.nfts = (prevBlock && prevBlock.nfts) ? new Map(prevBlock.nfts) : new Map();

    // Tracking ownership of NFTs
    this.nftOwnerMap = (prevBlock && prevBlock.nftOwnerMap) ? new Map(prevBlock.nftOwnerMap) : new Map();

  }

  /**
   * This method extends the parent method with support for gold locking transactions.
   * 
   * @param {Transaction} tx - A locking transaction.
   * @param {StakeClient} client - Used for printing debug messages.
   * 
   * @returns Success of adding transaction to the block.
   */
  addTransaction(tx, client) {
    //console.log(`Adding tx: ${JSON.stringify(tx)}`);
    if (!super.addTransaction(tx, client)) return false;

    // For standard transactions, we don't need to do anything else.
    if (tx.data === undefined || tx.data.type === undefined) return true;

    switch (tx.data.type) {

      case TX_TYPE_NFT_CREATE:
        this.createNft(tx.from, tx.id, tx.data.nft);
        break;

      case TX_TYPE_NFT_TRANSFER:
        this.transferNft(tx.data.addr.addr, tx.data.id.id, tx.data.sender.a)
        break;
    }

    // Transaction added successfully.
    return true;
  }

  /**
   * When rerunning a block, we must also replaying any NFT
   * related transactions.
   * 
   * @param {Block} prevBlock - The previous block in the blockchain, used for initial balances.
   * 
   * @returns {Boolean} - True if the block's transactions are all valid.
   */
  rerun(prevBlock) {
    this.nfts = new Map(prevBlock.nfts);
    this.nftOwnerMap = new Map(prevBlock.nftOwnerMap);

    return super.rerun(prevBlock);
  }

  createNft(owner, txID, nft) {
    // The ID of an NFT is the hash of the owner address and
    // the transaction ID.
    let nftID = utils.hash(`${owner}  ${txID}`);
    this.nfts.set(nftID, nft);

    // Adding NFT to artists list.
    let ownedNfts = this.nftOwnerMap.get(owner) || [];
    if(ownedNfts.includes(nftID) === false)
    {
      ownedNfts.push(nftID);
      this.nftOwnerMap.set(owner, ownedNfts);
    }
  }

  transferNft(reciever, nftID, sender) {
    let ownedNftsReciever = this.nftOwnerMap.get(reciever) || [];
    if(ownedNftsReciever.includes(nftID) === false)
    {
      ownedNftsReciever.push(nftID);
      this.nftOwnerMap.set(reciever, ownedNftsReciever);
    }

    let ownedNftsSender = this.nftOwnerMap.get(sender) || [];
    if(ownedNftsSender.includes(nftID) === true)
    {
      let i = 0;
      while (i < ownedNftsSender.length) 
      {
        if (ownedNftsSender[i] === nftID) 
        {
        ownedNftsSender.splice(i, 1);
        } 
        else 
        {
           ++i;
        }
      }
      this.nftOwnerMap.set(sender, ownedNftsSender);
    }
  }

  getNft(nftID) {
    return this.nfts.get(nftID);
  }

  getOwnersNftList(owner) {
    return this.nftOwnerMap.get(owner) || [];
  }

};