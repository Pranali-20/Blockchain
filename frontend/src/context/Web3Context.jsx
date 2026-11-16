import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractInfo from '../contracts/MedicalRecordVerification.json';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isContractLoaded, setIsContractLoaded] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setIsMetaMaskInstalled(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts) => {
          if (accounts.length > 0) {
            await setupAccount(accounts[0], browserProvider);
          }
        })
        .catch(console.error);

      // Listen for account / chain changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    } else {
      // Fallback read-only provider
      try {
        const jsonRpcProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        setProvider(jsonRpcProvider);
        if (contractInfo && contractInfo.contractAddress) {
          const readOnlyContract = new ethers.Contract(
            contractInfo.contractAddress,
            contractInfo.abi,
            jsonRpcProvider
          );
          setContract(readOnlyContract);
          setIsContractLoaded(true);
        }
      } catch (e) {
        console.warn('Local node RPC fallback unavailable:', e.message);
      }
    }
  }, []);

  async function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && provider) {
      await setupAccount(accounts[0], provider);
    } else {
      setAccount(null);
      setSigner(null);
    }
  }

  async function setupAccount(userAccount, browserProvider) {
    try {
      setAccount(userAccount);
      const userSigner = await browserProvider.getSigner();
      setSigner(userSigner);

      const network = await browserProvider.getNetwork();
      setChainId(Number(network.chainId));

      const bal = await browserProvider.getBalance(userAccount);
      setBalance(ethers.formatEther(bal));

      if (contractInfo && contractInfo.contractAddress && contractInfo.abi) {
        const smartContract = new ethers.Contract(
          contractInfo.contractAddress,
          contractInfo.abi,
          userSigner
        );
        setContract(smartContract);
        setIsContractLoaded(true);
      }
    } catch (err) {
      console.error('Error setting up Web3 account:', err);
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask extension is not detected. Please install MetaMask or use local simulation mode.');
      return false;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      await setupAccount(accounts[0], browserProvider);
      return true;
    } catch (err) {
      console.error('User rejected wallet connection:', err);
      return false;
    }
  };

  /**
   * Register record on the Ethereum blockchain via Smart Contract
   */
  const registerRecordOnBlockchain = async (recordId, hashBytes32, documentReference) => {
    if (!contract || !signer) {
      throw new Error('Please connect your MetaMask wallet to sign the blockchain transaction.');
    }
    try {
      const tx = await contract.registerRecord(recordId, hashBytes32, documentReference);
      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (err) {
      console.error('Blockchain registration error:', err);
      throw err;
    }
  };

  /**
   * Read verification view from contract
   */
  const verifyOnChain = async (recordId, hashBytes32) => {
    if (!contract) {
      throw new Error('Smart contract is not loaded');
    }
    return await contract.verifyRecordView(recordId, hashBytes32);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        contractAddress: contractInfo?.contractAddress || '',
        chainId,
        balance,
        isContractLoaded,
        isMetaMaskInstalled,
        connectWallet,
        registerRecordOnBlockchain,
        verifyOnChain
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
