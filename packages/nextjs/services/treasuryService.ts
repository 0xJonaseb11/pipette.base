'use server';

import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS as Address | undefined;

if (!TREASURY_PRIVATE_KEY) {
  throw new Error('TREASURY_PRIVATE_KEY is not set');
}

const account = privateKeyToAccount(TREASURY_PRIVATE_KEY as `0x${string}`);

if (TREASURY_ADDRESS && TREASURY_ADDRESS.toLowerCase() !== account.address.toLowerCase()) {
  throw new Error('TREASURY_ADDRESS does not match derived address from TREASURY_PRIVATE_KEY');
}

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: baseSepolia,
  account,
  transport: http(),
});

export async function getTreasuryBalance(): Promise<bigint> {
  const address = account.address;

  return publicClient.getBalance({ address });
}

export async function sendFromTreasury(
  to: Address,
  amountWei: bigint,
): Promise<`0x${string}`> {
  const hash = await walletClient.sendTransaction({
    to,
    value: amountWei,
  });

  return hash;
}

