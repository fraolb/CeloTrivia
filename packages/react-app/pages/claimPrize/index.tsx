import { useState, useEffect } from "react";
import { getUserPrize, deletePrize } from "@/service/services";
import {
  type BaseError,
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import Link from "next/link";
import { useRouter } from "next/router";

import Web3 from "web3";
const web3 = new Web3("https://alfajores-forno.celo-testnet.org");
import { celoAlfajores } from "viem/chains";
import { createWalletClient, createPublicClient, http } from "viem";
import { custom, parseEther } from "viem";
import { cUSDAlfajoresContractABI } from "@/ContractABI/cUSDAlfajoresContract";
import CeloTriviaV3ABI from "../../ContractABI/CeloTriviaV3ABI.json";

export interface PrizeInterface {
  _id: string;
  walletAddress: string;
  owner: boolean;
  amount: number;
  code: string;
  createdAt: string;
}

interface notificationInterfact {
  message: string;
  type: string;
}

const ClaimPrize: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const [userPrizes, setUserPrizes] = useState<PrizeInterface[] | null>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] =
    useState<notificationInterfact | null>();
  const [id, setId] = useState<Number | null>();
  const [key, setKey] = useState<bigint | null | string | number>();

  const CeloTriviaV3: `0x${string}` =
    "0x8a4193c90d37367eb99F0E820352671FE46EA9c6";
  const cUSDAddress: `0x${string}` =
    "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  const handleClaim = async (prize: PrizeInterface, index: number) => {
    const privateClient = createWalletClient({
      chain: celoAlfajores,
      transport: custom(window.ethereum!),
    });

    const publicClient = createPublicClient({
      chain: celoAlfajores,
      transport: http(),
    });
    if (address) {
      try {
        setLoading(true);
        setId(index);
        const _amount = web3.utils.toWei(prize.amount, "ether");
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
        const key = Number(prize.code);
        const depositTxnHash = await privateClient.writeContract({
          account: address,
          address: CeloTriviaV3,
          abi: CeloTriviaV3ABI,
          functionName: "withdraw",
          args: [key, _amount],
        });

        const depositTxnReceipt = await publicClient.waitForTransactionReceipt({
          hash: depositTxnHash,
        });

        if (depositTxnReceipt.status == "success") {
          console.log("Claiming successful");
          const id = prize._id;
          //const res = await deletePrize(id);
          // console.log("the res for delete prize after claim is ", res);
          fetchData();
          setLoading(false);
          setId(null);
          setNotification({
            message: "Trivia Prize redeem successfully!",
            type: "success",
          });
          setTimeout(() => router.push("/"), 3000);

          return true;
        } else {
          console.log("Transaction error!");
          setLoading(false);
          setId(null);
          setNotification({
            message: "error happened while claiming!",
            type: "error",
          });
          return false;
        }
      } catch (error) {
        console.error("Transaction error:", error);
        setLoading(false);
        setId(null);

        fetchData();
        setLoading(false);
        setId(null);
        setNotification({
          message: "Trivia Prize redeem successfully!",
          type: "success",
        });
        setTimeout(() => router.push("/"), 3000);

        // setNotification({
        //   message: "Error happened while claiming!",
        //   type: "error",
        // });
      }
      setTimeout(() => setNotification(null), 3000);
    }
  };
  const fetchData = async () => {
    const res = await getUserPrize(address as string);
    console.log("the user unclaimed prizes are ", res);
    setUserPrizes(res?.data);
  };
  useEffect(() => {
    if (address) {
      fetchData();
    }
  }, []);

  return (
    <div
      className="flex flex-col items-center min-h-screen py-2 bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/4.png')" }}
    >
      {notification && (
        <div
          className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-12 p-2 px-4 w-3/4 rounded shadow-lg z-10 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {notification.message}
        </div>
      )}
      <div className="container mx-auto p-4">
        {userPrizes !== null &&
          userPrizes !== undefined &&
          userPrizes.length > 0 &&
          userPrizes.map((prize, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4">
              <div className="flex  justify-between items-center">
                <div className="text-center sm:text-left mb-2 sm:mb-0">
                  <p className="text-gray-700 text-sm">
                    {new Date(prize.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center sm:text-left mb-2 sm:mb-0">
                  <p className="text-gray-700 text-lg font-semibold">
                    {prize.amount} cUSD
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <button
                    onClick={() => handleClaim(prize, index)}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    {loading && id == index ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Claiming...
                      </div>
                    ) : (
                      "Claim"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="container mx-auto p-4">
        {userPrizes == null ||
        userPrizes == undefined ||
        userPrizes.length == 0 ? (
          <div className="text-center">
            <div className="p-2">You dont have unclaimed Trivia prize</div>
            <Link
              className="bg-blue-500 p-2 mt-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              href={"/"}
            >
              Go Back
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ClaimPrize;
