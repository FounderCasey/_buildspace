import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FallingEmojis } from 'falling-emojis';
import abi from "./utils/WavePortal.json";
import './App.css';

export default function App() {

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [allShakes, setAllShakes] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  const contractAddress = "0x3F43C2677319f0f4AD97DDF5067df75C4BCB978D";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllShakes();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const getAllShakes = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const shakes = await wavePortalContract.getAllShakes();


        let shakesCleaned = [];
        shakes.forEach(shake => {
          shakesCleaned.push({
            address: shake.shaker,
            timestamp: new Date(shake.timestamp * 1000),
            message: shake.message
          });
        });
        setAllShakes(shakesCleaned);

        wavePortalContract.on("NewShake", (from, timestamp, message) => {
          console.log("NewShake", from, timestamp, message);

          setAllShakes(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const shake = async () => {
    setLoading(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalShakes();

        const shakeTxn = await wavePortalContract.shake(userMessage, { gasLimit: 300000 });

        await shakeTxn.wait();

        count = await wavePortalContract.getTotalShakes();
        setShow(true);
        setUserMessage("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
    setLoading(false);
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there, shaker!
        </div>

        <div className="bio">
          I'm Casey - a Frontend Engineer and Community Manager at DEV. As we head into fall, we're going to be shaking some trees. Connect your Ethereum wallet and make the leaves fall!
        </div>

        {currentAccount &&
          <input type="text" value={userMessage} onChange={e => setUserMessage(e.target.value)} placeholder="Tell us where you're from!" />
        }

        {!currentAccount
          ? <button className="waveButton slideup" onClick={connectWallet}>
            Connect Wallet
            </button>
          : <button className="waveButton slideup" disabled={userMessage == ""} onClick={shake}>
            {!loading
              ? ""
              : <div className="spinner"></div>
            }
            {loading ? "We're shaking the tree!" : "Shake a Tree 🌳"}
            </button>
        }

        <div className="message-container">
        {allShakes.map((shake, index) => {
          return (
            <div key={index} className="message slideup">
              <div>{shake.message}</div>
              <div className="info">
                <p>{shake.address}</p>
                <p>{shake.timestamp.toLocaleDateString()} - {shake.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>)
        })}
        </div>

        {show &&
          <FallingEmojis emoji={'🍁'} />
        }

        {show &&
          <FallingEmojis emoji={'🍁'} />
        }

      </div>
    </div>
  );
}
