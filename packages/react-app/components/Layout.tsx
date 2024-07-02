import { useRouter } from "next/router";
import { FC, ReactNode } from "react";
import Navigation from "./Navigation";
import "react-h5-audio-player/lib/styles.css";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
