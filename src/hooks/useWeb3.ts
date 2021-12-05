import { useCallback, useEffect, useState } from "react";

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
  const [account, setAccount] = useState("");

  useEffect(() => {
    const newEthereum = getEthereumObj();
    if (newEthereum) {
      setEthereum(newEthereum);
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

  return { account, connect };
};
