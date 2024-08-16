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

    const tx = await (contract.connect(bidder1) as Contract).submitBid(1, bidAmount, 15, proposedMilestones);
    const receipt = await tx.wait();

    const eventLog = receipt.logs.find(log => log.fragment?.name === "BidSubmitted");

    expect(eventLog).to.not.be.undefined;
    const eventArgs = eventLog.args;

    expect(eventArgs[2]).to.equal(bidder1.address); // bidder
  });

  it("Should allow the owner to select a bid", async function () {
    const tx = await (contract.connect(owner) as Contract).selectBid(1, 0);
    const receipt = await tx.wait();

    const eventLog = receipt.logs.find(log => log.fragment?.name === "BidSelected");

    expect(eventLog).to.not.be.undefined;
    const eventArgs = eventLog.args;

    expect(eventArgs[1]).to.equal(bidder1.address); // selectedBidder
});

it("Should allow the owner to release milestone payments", async function () {
    await owner.sendTransaction({
        to: contract.target,
        value: ethers.parseEther("3.0")
    });

    const tx = await (contract.connect(owner) as Contract).releaseMilestonePayment(1, 0);
    const receipt = await tx.wait();

    const eventLog = receipt.logs.find(log => log.fragment?.name === "MilestonePaid");
    expect(eventLog).to.not.be.undefined;

});

it("Should allow the bidder to raise a dispute", async function () {
    const tx =  await (contract.connect(bidder1) as Contract).raiseDispute(1, "Milestone not met");
    const receipt = await tx.wait();

    const eventLog = receipt.logs.find(log => log.fragment?.name === "DisputeRaised");

    expect(eventLog).to.not.be.undefined;
    const eventArgs = eventLog.args;

    expect(eventArgs[2]).to.equal(bidder1.address); // disputant
});

it("Should allow stakeholders to vote on a dispute", async function () {
    const disputeId = 1;

    const txYes = await (contract.connect(owner) as Contract).voteOnDispute(disputeId, true);
    await txYes.wait();

    // const txNo = await (contract.connect(bidder2) as Contract).voteOnDispute(disputeId, false);
    // await txNo.wait();

    const dispute = await contract.disputes(disputeId);
    expect(dispute.resolved).to.be.true;
});

});
