export const metadata = {
  title: "Privacy Policy",
  description: "Pipette privacy policy — how we handle your data",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-base-content mb-6">Privacy Policy</h1>
      <p className="text-sm text-base-content/70 mb-8">Last updated: February 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-base-content/90">
        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">1. Overview</h2>
          <p>
            Pipette (&quot;we&quot;, &quot;our&quot;, &quot;the app&quot;) is a Base Sepolia developer faucet. We are committed to
            protecting your privacy. This policy describes what data we collect and how we use it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">2. Data We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Wallet address</strong> — When you connect your wallet and claim testnet ETH, we store your
              wallet address to enforce cooldowns and prevent abuse.
            </li>
            <li>
              <strong>GitHub profile data</strong> — If you link GitHub, we receive your public GitHub ID, username,
              account age, public repos count, and followers. We use this for anti-sybil scoring only. We do not store
              OAuth tokens.
            </li>
            <li>
              <strong>Claim history</strong> — We record when you claim, amounts, and transaction hashes for
              analytics and anti-abuse.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">3. How We Use Your Data</h2>
          <p>We use this data to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Distribute Base Sepolia testnet ETH fairly</li>
            <li>Enforce one claim per wallet per 24 hours</li>
            <li>Score eligibility and reduce sybil abuse</li>
            <li>Improve the service</li>
          </ul>
          <p className="mt-4">We do not sell, rent, or share your data with third parties for marketing.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">4. Data Storage</h2>
          <p>
            Data is stored in Supabase (database and authentication). Access is restricted and protected. Claim
            history and wallet data are retained as long as needed to operate the faucet.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">5. Third Parties</h2>
          <p>
            We use Supabase (data storage), Coinbase CDP (faucet refill), and Vercel (hosting). Each has its own
            privacy policy. Your wallet interactions use standard Ethereum signing — we do not have access to your
            private keys.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">6. Contact</h2>
          <p>
            For questions about this policy, reach out via the Pipette repository or community channels.
          </p>
        </section>
      </div>
    </div>
  );
}
