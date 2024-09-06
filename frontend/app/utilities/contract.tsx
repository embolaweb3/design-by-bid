"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Contract, ethers, BrowserProvider } from 'ethers';
import ABI from './abi.json';

// Contract address
const CONTRACT_ADDRESS = '0xf540C264e37a4FCA2830caEEAF919E256c3331e4';

interface ContractContextProps {
  contract: Contract | null;
  fetchProjects: () => Promise<any>;
  submitBid: (projectId: string, bidAmount: string, completionTime: number) => Promise<void>;
  releaseMilestonePayment: (projectId: string, milestoneIndex: number) => Promise<void>;
}

const ContractContext = createContext<ContractContextProps | undefined>(undefined);

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      const { ethereum } = window as any;
      if (!ethereum) return;
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new Contract(CONTRACT_ADDRESS, ABI, signer);
      setContract(contractInstance);
    };

    initContract();
  }, []);

  const fetchProjects = async () => {
    if (!contract) return;
    console.log(contract)
    const projects = await contract.fetchProjects();
    // console.log(projects);
    // return projects;
  };

  const submitBid = async (projectId: string, bidAmount: string, completionTime: number) => {
    if (!contract) return;
    const tx = await contract.submitBid(projectId, ethers.parseEther(bidAmount), completionTime);
    await tx.wait();
  };

  const releaseMilestonePayment = async (projectId: string, milestoneIndex: number) => {
    if (!contract) return;
    const tx = await contract.releaseMilestonePayment(projectId, milestoneIndex);
    await tx.wait();
  };

  return (
    <ContractContext.Provider
      value={{ contract, fetchProjects, submitBid, releaseMilestonePayment }}
    >
      {children}
    </ContractContext.Provider>
  );
};
