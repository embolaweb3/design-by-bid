import { expect } from 'chai';
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import * as ethers from "ethers";

describe("DesignByBid Contract", function () {
    let contract : Contract;
    let owner : Wallet
    let bidder1 : Wallet  
    let bidder2 : Wallet;
    let projectId;
    const milestones = [ethers.parseEther("1.0"), ethers.parseEther("2.0")]; // milestones in Ether


  before(async function () {
    owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    bidder1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    bidder2 = getWallet(LOCAL_RICH_WALLETS[2].privateKey);

    contract = await deployContract("DesignByBid", [], { wallet: owner, silent: true });

  });

  it("Should post a project", async function () {
    const tx = await (contract.connect(owner) as Contract).postProject("Project 1", ethers.parseEther("3.0"), 30, milestones);
    const receipts = await tx.wait();
    // Find the correct log that contains the event arguments
    const eventLog = receipts.logs.find(log => log.fragment?.name === "ProjectPosted");

    expect(eventLog).to.not.be.undefined;

    // Extract the event arguments
    const eventArgs = eventLog.args;

    // Assert the event arguments
    expect(eventArgs[0]).to.exist; // projectId
    expect(eventArgs[1]).to.equal(owner.address); // owner
    expect(eventArgs[2]).to.equal("Project 1"); // description
    expect(eventArgs[3]).to.equal(ethers.parseEther("3.0")); // budget
    expect(eventArgs[4].toString()).to.equal('30'); // deadline

});

  it("Should allow a contractor to submit a bid", async function () {
    const bidAmount = ethers.parseEther("3.0");
    const proposedMilestones = [ethers.parseEther("1.0"), ethers.parseEther("2.0")];

    const tx = await contract.connect(bidder1).submitBid(projectId, bidAmount, 15, proposedMilestones);
    const receipt = await tx.wait();

    const eventLog = receipt.logs.find(log => log.fragment?.name === "BidSubmitted");

    expect(eventLog).to.not.be.undefined;
    const eventArgs = eventLog.args;

    expect(eventArgs[1]).to.equal(bidder1.address); // bidder
  });


});
