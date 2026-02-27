import { type Address, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

interface TreasuryClients {
  publicClient: { getBalance: (args: { address: Address }) => Promise<bigint> };
  walletClient: { sendTransaction: (args: { to: Address; value: bigint }) => Promise<`0x${string}`> };
  account: { address: Address };
}

let cached: TreasuryClients | null = null;

function getClients(): TreasuryClients {
  if (!cached) {
    const key = process.env.TREASURY_PRIVATE_KEY;
    if (!key) throw new Error("TREASURY_PRIVATE_KEY is not set");
    const account = privateKeyToAccount(key as `0x${string}`);
    const addr = process.env.TREASURY_ADDRESS as Address | undefined;
    if (addr && addr.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("TREASURY_ADDRESS does not match derived address from TREASURY_PRIVATE_KEY");
    }
    cached = {
      publicClient: createPublicClient({ chain: baseSepolia, transport: http() }),
      walletClient: createWalletClient({ chain: baseSepolia, account, transport: http() }),
      account,
    };
  }
  return cached;
}

export async function getTreasuryBalance(): Promise<bigint> {
  const { publicClient, account } = getClients();
  return publicClient.getBalance({ address: account.address });
}

export async function sendFromTreasury(to: Address, amountWei: bigint): Promise<`0x${string}`> {
  const { walletClient } = getClients();
  return walletClient.sendTransaction({ to, value: amountWei });
}
