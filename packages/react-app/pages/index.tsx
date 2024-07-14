import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import io from "socket.io-client";

interface notificationInterfact {
  message: string;
  type: string;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [room, setRoom] = useState<string>("");
  const { address, isConnected } = useAccount();
  const [notification, setNotification] =
    useState<notificationInterfact | null>();
  const router = useRouter();

  if (typeof window !== "undefined") {
    // @ts-ignore
    window.Browser = {
      T: () => {},
    };
  }
  console.log(`the server api is ${process.env.NEXT_PUBLIC_SERVER_API}`);
  const handleJoin = () => {
    const socket = io(
      `${process.env.NEXT_PUBLIC_SERVER_API || "http://localhost:3001"}`
    );

    socket.emit("check_room", room);

    socket.on("error", (message) => {
      setNotification({
        message: message,
        type: "error",
      });
    });
    socket.on("room_exists", (room) => {
      router.push(`/join/${room}`);
    });

    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      {isConnected ? (
        <div
          className="flex flex-col items-center justify-center min-h-screen py-2 bg-cover bg-center"
          style={{ backgroundImage: "url('/4.png')" }}
        >
          <Head>
            <title>Trivia App</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className="flex flex-col items-center w-full text-white flex-1 px-5 md:px-20 text-center">
            {notification && (
              <div
                className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-12 p-2 px-4 w-3/4 rounded shadow-lg z-10 ${
                  notification.type === "success"
                    ? "bg-green-500"
                    : "bg-red-500"
                } text-white`}
              >
                {notification.message}
              </div>
            )}
            <h1 className="text-3xl font-bold mt-24 mb-12 ">
              Welcome to Celo Trivia
            </h1>
            {/* <Link href={"/Tokens"}>check balance</Link> */}

            <div className="w-full max-w-md p-8 mt-20 rounded-lg shadow-md border border-solid bg-white bg-opacity-50">
              <input
                type="text"
                placeholder="Enter Trivia Code"
                onChange={(event) => {
                  setRoom(event.target.value);
                }}
                className="w-full p-3 mb-6 text-black text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleJoin()}
                className="w-full p-3 mb-4 text-lg font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Join Trivia
              </button>
            </div>

            <Link
              href={"/claimPrize"}
              className="bottom-10 p-3 px-6 text-md underline underline-offset-auto font-semibold text-white  rounded-md "
            >
              Claim previous prize
            </Link>
            <Link
              href={"/dashboard"}
              className="bottom-10 p-3 mt-12 px-6 text-lg font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create Trivia
            </Link>
          </main>
        </div>
      ) : (
        <div>No Wallet Connected</div>
      )}
    </div>
  );
}
