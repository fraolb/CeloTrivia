import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaTrash, FaPlus, FaPlay } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useRouter } from "next/router";
import PrizeModal from "@/components/PrizeModal";

// smart contract imports
import {
  type BaseError,
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { watchContractEvent } from "@wagmi/core";
import { ethers } from "ethers";
import { custom, parseEther } from "viem";
import { parseGwei } from "viem";
import { newKit } from "@celo/contractkit";
import CeloTriviaABI from "../../ContractABI/CeloTriviaABI.json";
import { config } from "@/config";
import { createWalletClient, createPublicClient, http } from "viem";
import { celoAlfajores } from "viem/chains";
import { cUSDAlfajoresContractABI } from "@/ContractABI/cUSDAlfajoresContract";
import cUSDTestnetContract from "../../ContractABI/cUSDTestnetContract.json";
import CeloTriviaV3ABI from "../../ContractABI/CeloTriviaV3ABI.json";

import Web3 from "web3";
const web3 = new Web3("https://alfajores-forno.celo-testnet.org");

import { TriviaInterface, QuestionInterface } from "@/types/questions";
import { getUserTrivia } from "@/service/services";

interface Trivia {
  _id: number;
  name: string;
}

export interface UserTriviaInterface {
  _id: string;
  walletAddress: string;
  triviaName: string;
  questions: QuestionInterface[];
}

const Dashboard: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const [userTrivia, setUserTrivia] = useState<UserTriviaInterface[] | null>(
    null
  );
  const [trivias, setTrivias] = useState<Trivia[]>([
    { _id: 1, name: "Trivia 1" },
    { _id: 2, name: "Trivia 2" },
    { _id: 3, name: "Trivia 3" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [currentTriviaId, setCurrentTriviaId] = useState<string | null>(null);
  const router = useRouter();

  ///smart contract part
  const [isLoading, setIsLoading] = useState(false);
  const CeloTriviaTestnet: `0x${string}` =
    "0xa889a8012f017Ec7B3DaFb428A0FCf06E6c8e490";
  const {
    data: hash,
    error,
    isPending,
    // status,
    writeContract,
  } = useWriteContract();
  const transactionExplorerUrl = useMemo(() => {
    return chainId == 42220
      ? `https://celoscan.io/tx/${hash}`
      : `https://explorer.celo.org/alfajores/tx/${hash}`;
  }, [hash]);

  const CeloTriviaV3: `0x${string}` =
    "0x8a4193c90d37367eb99F0E820352671FE46EA9c6";
  const cUSDAddress: `0x${string}` =
    "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  const handleDelete = (id: string) => {
    //setTrivias(trivias.filter((trivia) => trivia._id !== id));
  };

  const handleHost = (triviaId: string) => {
    setCurrentTriviaId(triviaId);
    setIsModalOpen(true);
  };

  const handleConfirmPrizes = async (prizes: number[]) => {
    const numberOfPrizes = prizes.length;
    const totalPrizeValue = prizes.reduce((sum, prize) => sum + prize, 0);

    console.log(`Number of prizes: ${numberOfPrizes}`);
    console.log(`Total prize value: ${totalPrizeValue}`);
    console.log(
      `Hosting trivia with ID ${currentTriviaId} with prizes: ${prizes}`
    );

    if (currentTriviaId !== null && address) {
      const privateClient = createWalletClient({
        chain: celoAlfajores,
        transport: custom(window.ethereum!),
      });

      const publicClient = createPublicClient({
        chain: celoAlfajores,
        transport: http(),
      });

      try {
        const key = Math.floor(Math.random() * 1_000_000_000);
        console.log("the key is ", key);
        setStatus("pending");
        const _amount = web3.utils.toWei(totalPrizeValue, "ether");

        const approveTxnHash = await privateClient.writeContract({
          account: address,
          address: cUSDAddress,
          abi: cUSDAlfajoresContractABI,
          functionName: "approve",
          args: [CeloTriviaV3, _amount],
        });

        const approveTxnReceipt = await publicClient.waitForTransactionReceipt({
          hash: approveTxnHash,
        });

        if (approveTxnReceipt.status !== "success") {
          return false;
        }

        console.log("Approval successful");

        // Deposit tokens
        const depositTxnHash = await privateClient.writeContract({
          account: address,
          address: CeloTriviaV3,
          abi: CeloTriviaV3ABI,
          functionName: "deposit",
          args: [key, _amount],
        });

        const depositTxnReceipt = await publicClient.waitForTransactionReceipt({
          hash: depositTxnHash,
        });

        if (depositTxnReceipt.status == "success") {
          console.log("Deposit successful");
          setIsLoading(false);
          setIsModalOpen(false);
          setStatus("");
          router.push(`/host/${currentTriviaId}`);
          return true;
        } else {
          setStatus(`error ${error}`);
          console.log("Transaction error!");
          console.log(error);
          return false;
        }
      } catch (error) {
        console.error("Transaction error:", error);
        setIsLoading(false);
      }
    }
  };

  const getUsersTriviaData = async () => {
    const res = await getUserTrivia(address as string);
    console.log("the user trivia are ", res);
    if (res.success == true) {
      setUserTrivia(res.data);
    }
  };
  useEffect(() => {
    if (address) {
      getUsersTriviaData();
    }
  }, [address]);

  return (
    <div
      className="flex flex-col items-center min-h-screen py-2 bg-cover bg-center"
      style={{ backgroundImage: "url('/4.png')" }}
    >
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/CTIcon.png" />
      </Head>

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-20 text-center text-white">
        <h1 className="text-4xl font-bold mt-20 mb-12">Dashboard</h1>

        <div className="flex justify-end w-full">
          <Link
            href="/create"
            className="flex items-center justify-center px-4 py-2 mb-6 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2" /> Create a New Trivia
          </Link>
        </div>

        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden text-black">
          <table className="min-w-full bg-white ">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200">
                  Previous Trivia
                </th>
                <th className="py-2 px-4 border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userTrivia !== null &&
                userTrivia.map((trivia) => (
                  <tr key={trivia._id}>
                    <td className="py-2 px-4 border-b border-gray-200 text-2xl">
                      {trivia.triviaName}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <button
                        className="bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-900 p-2 rounded-2xl"
                        onClick={() => handleHost(trivia._id)}
                      >
                        <FaPlay className="text-white pl-1" />
                      </button>
                      <button className="text-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-4">
                        <MdEdit />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 ml-4"
                        onClick={() => handleDelete(trivia._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <PrizeModal
          isOpen={isModalOpen}
          onFreeTrivia={() => {
            setIsModalOpen(false);
            router.push(`/host/${currentTriviaId}`);
          }}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onConfirm={handleConfirmPrizes}
          status={status}
          closeModal={() => {
            setIsModalOpen(false);
          }}
        />
        <div>
          {/* {isConfirming && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-65">
              <div className="bg-white p-4 rounded shadow-lg w-1/3 text-black">
                <h2 className="text-xl mb-4">Transaction is processing...</h2>
                <p>Please wait while the transaction is being confirmed.</p>
              </div>
            </div>
          )} */}
        </div>
        <div>
          {status == "pending" && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-65">
              <div className="bg-white p-4 rounded shadow-lg w-1/3 text-black">
                <h2 className="text-xl mb-4">STransaction is processing...</h2>
                <p>Please wait while the transaction is being confirmed.</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex flex-wrap">
          {hash && (
            <div className="w-full">
              Transaction Hash:{" "}
              <a
                className="align-center text-xs text-mainHard"
                href={transactionExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hash.substring(0, 8)}...{hash.substring(hash.length - 6)}
              </a>
            </div>
          )}
          {/* {isConfirming && (
            <div className="w-full">Waiting for confirmation...</div>
          )}
          {isConfirmed && <div className="w-full">Transaction confirmed.</div>}
          {error && (
            <div className="w-80">
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )} */}
          <div>the status is {status}</div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
