"use strict";

const { Client } = require('spartan-gold');

module.exports = class NftClient extends Client {

  /**
   * Post a transaction creating a new NFT owned by the client.
   */
  createNFT() {
    this.log("   Not yet implemented...");
  }

  /**
   * Post a transaction transferring an NFT to a new owner.
   */
  transferNFT() {
    this.log("   Not yet implemented...");
  }
}
