import { ethers, providers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import myEpicNft from "../abi/MyEpicNft.json";

const getEthereumObj = () => {
  const { ethereum } = window;

  if (!ethereum) {
    console.warn("Make sure you have metamask!");
    return;
  } else {
    console.log("Ethereum object: ", ethereum);
    return ethereum;
  }
};

export const useWeb3 = () => {
  const [ethereum, setEthereum] = useState<any>();
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [account, setAccount] = useState();

  useEffect(() => {
    const fn = async () => {
      const newEthereum = getEthereumObj();
      if (newEthereum) {
        setEthereum(newEthereum);
        const chainId = await newEthereum.request({ method: "eth_chainId" });
        const rinkebyChainId = "0x4";
        if (chainId !== rinkebyChainId) {
          alert("You are not connected to the Rinkeby Test Network!");
        }

        try {
          const newProvider = new ethers.providers.Web3Provider(newEthereum);
          setProvider(newProvider);
        } catch (err: any) {
          console.error(err);
        }
      }
    };
    fn();
  }, []);

  useEffect(() => {
    const fn = async () => {
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
          console.log("Found an authorized account:", accounts[0]);
          setAccount(accounts[0]);
        } else {
          console.log("No authorized account found.");
        }
      }
    };
    fn();
  }, [ethereum]);

  const connect = useCallback(async () => {
    if (!ethereum) {
      alert("Get Metamask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    console.log("Connected", accounts[0]);
    setAccount(accounts[0]);
  }, [ethereum]);

  return { account, provider, connect };
};

export const useContract = (provider?: providers.Web3Provider) => {
  const [contract, setContract] = useState<ethers.Contract>();
  const CONTRACT_ADDRESS = "0xc2487A48f81C585006F849CFDB7d92049900b0fe";

  useEffect(() => {
    if (provider) {
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );
      setContract(connectedContract);
    }
  }, [provider]);

  useEffect(() => {
    const callback = (from: string, tokenId: any) => {
      console.log(from, tokenId.toNumber());
      alert(
        `Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`
      );
    };
    if (contract) {
      contract.on("NewEpicNFTMinted", callback);
    }
    return () => {
      contract?.off("NewEpicNFTMinted", callback);
    };
  }, [contract]);

  const mintNft = useCallback(async () => {
    if (contract) {
      try {
        console.log("Going to pop wallet now to pay gas...");
        const nftTxn = await contract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } catch (err: any) {
        console.error(err);
      }
    }
  }, [provider, contract]);

  return { mintNft };
};
