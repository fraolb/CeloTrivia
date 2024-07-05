import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaTrash, FaPlus, FaPlay } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useRouter } from "next/router";
import PrizeModal from "@/components/PrizeModal";

interface Trivia {
  id: number;
  name: string;
}

const Dashboard: React.FC = () => {
  const [trivias, setTrivias] = useState<Trivia[]>([
    { id: 1, name: "Trivia 1" },
    { id: 2, name: "Trivia 2" },
    { id: 3, name: "Trivia 3" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTriviaId, setCurrentTriviaId] = useState<number | null>(null);
  const router = useRouter();

  const handleDelete = (id: number) => {
    setTrivias(trivias.filter((trivia) => trivia.id !== id));
  };

  const handleHost = (triviaId: number) => {
    setCurrentTriviaId(triviaId);
    setIsModalOpen(true);
  };

  const handleConfirmPrizes = (prizes: number[]) => {
    const numberOfPrizes = prizes.length;
    const totalPrizeValue = prizes.reduce((sum, prize) => sum + prize, 0);

    console.log(`Number of prizes: ${numberOfPrizes}`);
    console.log(`Total prize value: ${totalPrizeValue}`);
    console.log(
      `Hosting trivia with ID ${currentTriviaId} with prizes: ${prizes}`
    );

    // Navigate to host page with prize info
    if (currentTriviaId !== null) {
      // router.push(`/host/${currentTriviaId}?prizes=${JSON.stringify(prizes)}`);
    }
  };

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
        />
      </main>
    </div>
  );
};

export default Dashboard;
