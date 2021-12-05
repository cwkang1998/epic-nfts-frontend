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
    const newEthereum = getEthereumObj();
    if (newEthereum) {
      setEthereum(newEthereum);
      try {
        const newProvider = new ethers.providers.Web3Provider(newEthereum);
        setProvider(newProvider);
      } catch (err: any) {
        console.error(err);
      }
    }
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
  const CONTRACT_ADDRESS = "0xe3D2C057938B8f2b72810B3E5F889f7476E3c4cA";
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
