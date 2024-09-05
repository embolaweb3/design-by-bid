import { Contract, ethers,BrowserProvider } from 'ethers';
import ABI from './abi.json';

// contract address
const CONTRACT_ADDRESS = '0xc5B50274367808ffA04E8b13eb0f237507a5BecA';

let walletConnector:any

if(typeof window !==undefined){
  walletConnector = (window as any).ethereum
}

export const getContract = () => {
  const signer = new BrowserProvider(walletConnector);
  return new Contract(CONTRACT_ADDRESS, ABI, signer);
};

export const fetchProjects = async () => {
  const contract = getContract();
  const projects = await contract.getAllProjects();

  return projects.map((project) => ({
    id: project.id.toString(),
    description: project.description,
    budget: ethers.formatEther(project.budget),
    deadline: project.deadline.toNumber(),
    bids: project.bids.map((bid) => ({
      bidder: bid.bidder,
      bidAmount: ethers.formatEther(bid.bidAmount),
      completionTime: bid.completionTime.toNumber(),
    })),
    milestones: project.milestones,
    milestonePaid: project.milestonePaid,
  }));
};

export const submitBid = async ( projectId, bidAmount, completionTime) => {
  const contract = getContract();
  const tx = await contract.submitBid(
    projectId,
    ethers.parseEther(bidAmount),
    completionTime
  );
  await tx.wait();
};

export const releaseMilestonePayment = async ( projectId, milestoneIndex) => {
  const contract = getContract();
  const tx = await contract.releaseMilestonePayment(projectId, milestoneIndex);
  await tx.wait();
};
