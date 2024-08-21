"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnect from "../components/WalletConnect";

// Import ABIs and contract addresses
import contractAddresses from "../abis/contract-addresses.json";
import burnContractJSON from "../abis/BurnContract.json";
import sBTCJSON from "../abis/sBTC.json";

const burnContractABI = burnContractJSON.abi;
const sBTCABI = sBTCJSON.abi;

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signerAddress, setSignerAddress] = useState(null);

  const [burnContract, setBurnContract] = useState(null);
  const [sBTC, setSBTC] = useState(null);

  const burnContractAddress = contractAddresses.BurnContract;
  const sBTCAddress = contractAddresses.sBTC;
  useEffect(() => {
    if (provider && signer) {
      // Initialize contracts
      const burnContract = new ethers.Contract(
        burnContractAddress,
        burnContractABI,
        signer
      );
      setBurnContract(burnContract);
      const sBTC = new ethers.Contract(sBTCAddress, sBTCABI, signer);
      setSBTC(sBTC);
    }
  }, [provider, signer]);

  const burn = async () => {
    try {
      const destinationChain = "Wbitcoin";
      const destinationAddress = "0x9F3Ed8159e7c0Fe44Ccd945870f6DDD3062D58B2";
      const btcPsbtB64 =
        "0200000001a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890000000006a4730440220561db21e45ed7894ab528d6ab348c7b7dd0b6b8d09ab4a2c703bd9f786cfb7d002205b8db7a1f0a7c81f514f735b37f4a4d4d907c7aee64d8c8b0a6fcda23a715db3012103b1e2c84a9b3b1f7c6ebd73c6feddfe6a1e47b9c6a7f45d9f8b6d78197c8e8fb6ffffffff02e8030000000000001976a9147b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b88ac10270000000000001976a9148c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c88ac00000000";

      const amountToBurn = ethers.parseUnits("1", 18);

      const txApprove = await sBTC.approve(burnContractAddress, amountToBurn);
      await txApprove.wait();
      console.log("Approve transaction confirmed");

      // Call Burn
      const txCallBurn = await burnContract.callBurn(
        destinationChain,
        destinationAddress,
        amountToBurn,
        btcPsbtB64
      );

      await txCallBurn.wait();
      console.log("Burn transaction confirmed");
    } catch (error) {
      console.error("Error burning:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 p-8 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-12">DeFi App</h1>
      <div className="flex items-center space-x-6 mb-12">
        <WalletConnect
          setProvider={setProvider}
          setSigner={setSigner}
          setSignerAddress={setSignerAddress}
        />
      </div>
      {provider && (
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
          <button
            onClick={burn}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Burn
          </button>
        </div>
      )}
    </div>
  );
}
