import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaTrash, FaPlus, FaPlay } from "react-icons/fa";
import { useRouter } from "next/router";
import io from "socket.io-client";

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

  const router = useRouter();
  const socket = io("http://localhost:3001", {
    auth: { isCreator: true }, // Send authentication info
  });

  const handleDelete = (id: number) => {
    setTrivias(trivias.filter((trivia) => trivia.id !== id));
  };

  const handleHost = (triviaId: number) => {
    //const roomId = Math.random().toString(36).substring(2, 10); // Generate a random room ID
    const room = triviaId;
    // socket.emit("create_room", room, (response: any) => {
    //   console.log("the response is ", response);
    //   if (response.success) {
    router.push(`/host/${room}`);
    //   } else {
    //     console.error(response.error);
    //   }
    // });
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-2 bg-gray-100">
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold mt-6 mb-12">Dashboard</h1>

        <div className="flex justify-end w-full">
          <Link
            href="/create"
            className="flex items-center justify-center px-4 py-2 mb-6 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2" /> Create a New Trivia
          </Link>
        </div>

        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full bg-white">
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
                  <td className="py-2 px-4 border-b border-gray-200">
                    {trivia.name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <button
                      className="text-green-500 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      onClick={() => handleHost(trivia.id)}
                    >
                      <FaPlay />
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
      </main>
    </div>
  );
};

export default Dashboard;
