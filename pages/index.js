import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";
import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import abi from "../utils/EduBrew.json"; // Adjust path to the correct ABI file

export default function Home() {
  const contractAddress = "0xa4992B503da9eB548CeEc3DE25EB4aCFC7f12141"; // Replace with actual contract address

  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [allSponsorships, setAllSponsorships] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        toast.success(" 💰 Wallet is Connected", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const brewEducation = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const eduBrewContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        // Send ETH to sponsor education
        const txn = await eduBrewContract.brewEducation(
          name ? name : "Anonymous",
          message ? message : "No Message",
          { value: ethers.utils.parseEther("0.001"), gasLimit: 300000 }
        );
        console.log("Sending sponsorship...", txn.hash);

        toast.info("Sending sponsorship...", {
          position: "top-left",
          autoClose: 18050,
        });

        await txn.wait();

        console.log("Transaction mined:", txn.hash);

        setMessage("");
        setName("");

        toast.success("Sponsorship Sent!", {
          position: "top-left",
          autoClose: 5000,
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const getAllSponsorships = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const eduBrewContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const sponsorships = await eduBrewContract.getSponsorships();

        const sponsorshipsCleaned = sponsorships.map((sponsor) => ({
          address: sponsor.from,
          timestamp: new Date(sponsor.timestamp * 1000),
          message: sponsor.message,
          name: sponsor.name,
        }));

        setAllSponsorships(sponsorshipsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllSponsorships();
    checkIfWalletIsConnected();

    const onNewSponsorship = (from, timestamp, message, name) => {
      console.log("New Sponsorship", from, timestamp, message, name);
      setAllSponsorships((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
          name: name,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const eduBrewContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      eduBrewContract.on("NewSponsorship", onNewSponsorship);
    }

    return () => {
      if (eduBrewContract) {
        eduBrewContract.off("NewSponsorship", onNewSponsorship);
      }
    };
  }, []);

  const handleOnMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleOnNameChange = (event) => {
    setName(event.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Support Education</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-6">
          Support Education
        </h1>

        {currentAccount ? (
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Name"
                  onChange={handleOnNameChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  Send a Supportive Message
                </label>

                <textarea
                  className="form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Message"
                  id="message"
                  onChange={handleOnMessageChange}
                  required
                ></textarea>
              </div>

              <div className="flex items-left justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={brewEducation}
                >
                  Support $5
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-2xl text-blue-600 mb-6">
              You can switch your wallet to Linea Testnet Network to test this
              application.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full mt-3"
              onClick={connectWallet}
            >
              Connect Your Wallet
            </button>
          </div>
        )}

        {allSponsorships.map((sponsorship, index) => (
          <div className="border-l-2 mt-10" key={index}>
            <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-800 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
              <div className="w-5 h-5 bg-blue-600 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>
              <div className="w-10 h-1 bg-green-300 absolute -left-10 z-0"></div>
              <div className="flex-auto">
                <h1 className="text-md">Supporter: {sponsorship.name}</h1>
                <h1 className="text-md">Message: {sponsorship.message}</h1>
                <h3>Address: {sponsorship.address}</h3>
                <h4>{sponsorship.timestamp.toString()}</h4>
              </div>
            </div>
          </div>
        ))}
      </main>


      <ToastContainer />
    </div>
  );
}
