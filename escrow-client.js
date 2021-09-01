"use strict";

const { Blockchain } = require('spartan-gold');

const NftBlock = require('./nft-block');
const NftClient = require('./nft-client');

// A client that serves the role of a smart contract.
// It is possible to deceive this client, but it is
// only here for simulation purposes.
module.exports = class EscrowClient extends NftClient {
  constructor(...args) {
    super(...args);
    this.conditions = [];
    this.action = undefined;

    // NOTE: monitoring the blocks produced would be better,
    // since that gives more confidence that the transaction
    // was valid.  Better still would be to monitor the
    // confirmed blocks.
    this.on(Blockchain.POST_TRANSACTION, this.testTransaction);
  }

  // Sets the "smart contract".  Only one contract
  // may be active at a time.
  setContract(conditions, action) {
    if (this.conditions.length !== 0) {
      throw new Error("Already have a contract");
    }
    this.conditions = conditions;
    this.action = action;
  }

  // Tests whether any of the conditions are satisfied.
  // Once all conditions are satisfied, the action
  // is executed.
  testTransaction(tx) {
    this.log("Testing conditions");
    let remainingConditions = [];
    this.conditions.forEach((cond) => {
      if (!cond(tx)) remainingConditions.push(cond);
      else { this.log("++++CONDITION MET++++"); }
    });
    this.conditions = remainingConditions;
    if (this.conditions.length === 0 && this.action) {
      this.log("++++CONDUCTING EXCHANGE+++");
      this.action();
      delete this.action;
    }
  }
}