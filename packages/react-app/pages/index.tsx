import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { address, isConnected } = useAccount();

  if (typeof window !== "undefined") {
    // @ts-ignore
    window.Browser = {
      T: () => {},
    };
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      {isConnected ? (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
          <Head>
            <title>Trivia App</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className="flex flex-col items-center w-full flex-1 px-5 md:px-20 text-center">
            <h1 className="text-4xl font-bold mt-6 mb-12">
              Welcome to Trivia App
            </h1>

            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-solid">
              <input
                type="text"
                placeholder="Enter Quiz Code"
                className="w-full p-3 mb-6 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="w-full p-3 mb-4 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Join Trivia
              </button>
            </div>

            <Link
              href={"/create"}
              className="fixed bottom-10 p-3 text-lg font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create Trivia
            </Link>
          </main>
        </div>
      ) : (
        //   </div>
        // </div>
        <div>No Wallet Connected</div>
      )}
    </div>
  );
}
