"use strict";

const { Block, utils } = require('spartan-gold');

const TX_TYPE_NFT_FUNDRAISER_INIT = "NFT_FUNDRAISER_INIT";
const TX_TYPE_NFT_FUNDRAISER_CONTRIB = "NFT_FUNDRAISER_CONTRIB";
const TX_TYPE_NFT_CREATE = "NFT_CREATE";
const TX_TYPE_NFT_TRANSFER = "NFT_TRANSFER";

module.exports = class NftBlock extends Block {

  static get TX_TYPE_NFT_CREATE() { return TX_TYPE_NFT_CREATE; }
  static get TX_TYPE_NFT_TRANSFER() { return TX_TYPE_NFT_TRANSFER; }
  static get TX_TYPE_NFT_FUNDRAISER_INIT() { return TX_TYPE_NFT_FUNDRAISER_INIT; }
  static get TX_TYPE_NFT_FUNDRAISER_CONTRIB() { return TX_TYPE_NFT_FUNDRAISER_CONTRIB; }

  constructor(rewardAddr, prevBlock, target, coinbaseReward) {
    super(rewardAddr, prevBlock, target, coinbaseReward);

    // Tracking NFTs
    this.nfts = (prevBlock && prevBlock.nfts) ? new Map(prevBlock.nfts) : new Map();

    // Tracking ownership of NFTs
    this.nftOwnerMap = (prevBlock && prevBlock.nftOwnerMap) ? new Map(prevBlock.nftOwnerMap) : new Map();

    // Tracking fundraisers
    this.fundraisers = (prevBlock && prevBlock.fundraisers) ? new Map(prevBlock.fundraisers) : new Map();
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
    console.log();
    if (!super.addTransaction(tx, client)) {
      return false;
    } 

    // For standard transactions, we don't need to do anything else.
    if (tx.data === undefined || tx.data.type === undefined){
      return true;
    }

    switch (tx.data.type) {

      case TX_TYPE_NFT_FUNDRAISER_INIT: 
        this.initFundraiser(tx.from, tx.data.projectID, tx.data);
        break;

      case TX_TYPE_NFT_FUNDRAISER_CONTRIB: 
        let fundraiserID = this.calcFundraiserID(tx.data.artistID, tx.data.projectID);
        // Reject contributions from fundraisers that are not yet known.
        return this.contribute(tx.from, fundraiserID, tx.data.amount);

      case TX_TYPE_NFT_CREATE: 
        this.createNft(tx.from, tx.id, tx.data.nft);
        break;

      case TX_TYPE_NFT_TRANSFER:
        this.transferNft(tx.from, tx.data.r, tx.data.t, tx.data.a);
        break;

      default:
        throw new Error(`Unrecognized type: ${tx.data.type}`);
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
    this.fundraisers = new Map(prevBlock.fundraisers);

    return super.rerun(prevBlock);
  }

  calcFundraiserID(artistID, projectID) {
    return utils.hash(`${artistID}||${projectID}`);
  }

  initFundraiser(artistID, projectID, {
    projectName, projectDescription, endDate, maxFunding, artistShare,
  }) {
    let fundraiserID = this.calcFundraiserID(artistID, projectID);
    this.fundraisers.set(fundraiserID, {
      donations: [],
      artistID,
      projectName,
      projectDescription,
      endDate,
      maxFunding,
      artistShare,
    });
  }
  
  listFundraisers() {
    this.fundraisers.forEach((fr, frID) => {
      let artistShare = parseFloat(fr.artistShare);
      let currentFunding = fr.donations.reduce((acc, {amount}) => {
        return acc + parseInt(amount);
      }, 0);
      console.log(`
  Fundraiser ${frID}:
  ===========================================================
  "${fr.projectName}", by artist ${fr.artistID}.
  Artist will keep ${artistShare * 100}% of the first sale price.
  (${currentFunding}/${fr.maxFunding} funding received.)
  Description: ${fr.projectDescription}
  Donations: ${fr.donations.length}
      `);
    });
  }

  contribute(donorID, fundraiserID, amount) {
    let fr = this.fundraisers.get(fundraiserID);
    if (fr === undefined) {
      console.log(`Unknown fundraiser ${fundraiserID}`)
      return false;
    }
    fr.donations.push({ donorID, amount });
    this.fundraisers.set(fundraiserID, fr);
    return true;
  }

  createNft(owner, txID, nft) {
    // The ID of an NFT is the hash of the owner address and
    // the transaction ID.
    let nftID = utils.hash(`${owner}  ${txID}`);
    this.nfts.set(nftID, nft);
    
    // Adding NFT to artists list.
    let ownedNfts = this.nftOwnerMap.get(owner) || [];
    if (!ownedNfts.includes(nftID)) {
      ownedNfts.push(nftID);
      this.nftOwnerMap.set(owner, ownedNfts);
    }
  }

  /*transferNft(sender, receiver, title, artName) {
    let nftList = this.getOwnersNftList(sender);
    
    // Getting nftID
    let nftID = this.getNftId(title, artName, nftList);

    // Adding NFT to artists list.  
    let ownedNftsReceiver = this.nftOwnerMap.get(receiver) || [];
    console.log(ownedNftsReceiver);
    if(!ownedNftsReceiver.includes(nftID)) {
        ownedNftsReceiver.push(nftID);
        this.nftOwnerMap.set(receiver, ownedNftsReceiver);
        console.log(ownedNftsReceiver);
    }

    // Removing nft from sender
    let ownedNftsSender = this.nftOwnerMap.get(sender) || [];
    if(ownedNftsSender.includes(nftID) === true) {
      let i = 0;
      while (i < ownedNftsSender.length) {
        if (ownedNftsSender[i] === nftID) {
          ownedNftsSender.splice(i, 1);
        } else {
           ++i;
        }
      }
      this.nftOwnerMap.set(sender, ownedNftsSender);
      return;
    }

  }

  transferNft(owner, receiver, title, artName) {
    let sent = receiver;
    let nftList = this.getOwnersNftList(owner);

    let nftIdentifier = this.getNftId(title, artName, nftList);
    // Adding NFT to artists list.
    let sentNfts = this.nftOwnerMap.get(sent) || [];
    sentNfts.push(nftIdentifier);
    this.nftOwnerMap.set(sent, sentNfts);
    let ownedNfts = this.nftOwnerMap.get(owner) || [];
    ownedNfts.pop(nftIdentifier);

  }
  */

  getNft(nftID) {
    return this.nfts.get(nftID);
  }

  getNftId(title, artName, nftList) { 
    var nftIdent;
    nftList.forEach(nftID => {
      let nft = this.getNft(nftID);
      if (nft.artistName === artName) {
        if (nft.title === title) {
          nftIdent = nftID;
        }
      }
    });
    return nftIdent;
  }

  getOwnersNftList(owner) {
    return this.nftOwnerMap.get(owner) || [];
  }

};
