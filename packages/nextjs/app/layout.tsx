import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { Analytics } from "@vercel/analytics/next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Pipette",
  description:
    "Get Base Sepolia testnet ETH for African web3 builders. Connect your wallet, link GitHub, and claim. No mainnet gas required.",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning lang="en" data-theme="light">
      <body>
        <ThemeProvider defaultTheme="light" forcedTheme="light" enableSystem={false}>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
      <Analytics />
    </html>
  );
};

export default ScaffoldEthApp;
