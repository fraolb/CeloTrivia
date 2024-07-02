import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

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
        <div className="container mx-auto p-4">no data</div>
      ) : (
        //   </div>
        // </div>
        <div>No Wallet Connected</div>
      )}
    </div>
  );
}
