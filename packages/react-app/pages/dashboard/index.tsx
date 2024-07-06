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
import { parseEther } from "viem";
import { parseGwei } from "viem";
import { newKit } from "@celo/contractkit";
import CeloTriviaABI from "../../ContractABI/CeloTriviaABI.json";
import { config } from "@/config";

interface Trivia {
  id: number;
  name: string;
}

const Dashboard: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const [trivias, setTrivias] = useState<Trivia[]>([
    { id: 1, name: "Trivia 1" },
    { id: 2, name: "Trivia 2" },
    { id: 3, name: "Trivia 3" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTriviaId, setCurrentTriviaId] = useState<number | null>(null);
  const router = useRouter();

  ///smart contract part
  const [isLoading, setIsLoading] = useState(false);
  const CeloTriviaTestnet = "0xa889a8012f017Ec7B3DaFb428A0FCf06E6c8e490";
  const {
    data: hash,
    error,
    isPending,
    status,
    writeContract,
  } = useWriteContract();
  const transactionExplorerUrl = useMemo(() => {
    return chainId == 42220
      ? `https://celoscan.io/tx/${hash}`
      : `https://explorer.celo.org/alfajores/tx/${hash}`;
  }, [hash]);

  const handleDelete = (id: number) => {
    setTrivias(trivias.filter((trivia) => trivia.id !== id));
  };

  const handleHost = (triviaId: number) => {
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
      try {
        const key = Math.floor(Math.random() * 1_000_000_000);
        console.log("the key is ", key);
        await writeContract({
          address: CeloTriviaTestnet,
          account: address,
          abi: CeloTriviaABI,
          functionName: "deposit",
          args: [key],
          value: parseEther(`${totalPrizeValue}`),
        });
      } catch (error) {
        console.error("Transaction error:", error);
        setIsLoading(false);
      }
    }
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirming) {
      console.log("Pending transaction...");
    }

    if (isConfirmed) {
      console.log("Transaction confirmed:", hash);
      setIsLoading(false);
      setIsModalOpen(false);
      router.push(`/host/${currentTriviaId}`);
    }
  }, [isLoading, isConfirmed, hash]);

  return (
    <div
      className="flex flex-col items-center min-h-screen py-2 bg-cover bg-center"
      style={{ backgroundImage: "url('/4.png')" }}
    >
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
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
              {trivias.map((trivia) => (
                <tr key={trivia.id}>
                  <td className="py-2 px-4 border-b border-gray-200 text-2xl">
                    {trivia.name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <button
                      className="bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-900 p-2 rounded-2xl"
                      onClick={() => handleHost(trivia.id)}
                    >
                      <FaPlay className="text-white pl-1" />
                    </button>
                    <button className="text-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-4">
                      <MdEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 ml-4"
                      onClick={() => handleDelete(trivia.id)}
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
          {isConfirming && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-65">
              <div className="bg-white p-4 rounded shadow-lg w-1/3 text-black">
                <h2 className="text-xl mb-4">Transaction is processing...</h2>
                <p>Please wait while the transaction is being confirmed.</p>
              </div>
            </div>
          )}
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
          {isConfirming && (
            <div className="w-full">Waiting for confirmation...</div>
          )}
          {isConfirmed && <div className="w-full">Transaction confirmed.</div>}
          {error && (
            <div className="w-80">
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
