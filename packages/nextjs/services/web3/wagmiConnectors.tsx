import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import scaffoldConfig from "~~/scaffold.config";

const wallets = [metaMaskWallet, walletConnectWallet, ledgerWallet, rainbowWallet, safeWallet];

export const wagmiConnectors = () => {
  if (typeof window === "undefined") {
    return [];
  }

  return connectorsForWallets(
    [
      {
        groupName: "Supported Wallets",
        wallets,
      },
    ],
    {
      appName: "Pipette",
      projectId: scaffoldConfig.walletConnectProjectId,
    },
  );
};
