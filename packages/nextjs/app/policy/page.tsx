export const metadata = {
  title: "Terms & Policy",
  description: "Pipette terms of use and policy. Testnet distribution in compliance with Base.",
};

export default function PolicyPage() {
  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto px-4 py-12 bg-base-200">
      <h1 className="text-2xl font-bold text-base-content mb-6">Terms & Policy</h1>
      <p className="text-sm text-base-content/70 mb-8">Last updated: February 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-base-content/90">
        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">1. Purpose</h2>
          <p>
            Pipette powers newbie African Web3 with Base Sepolia testnet tokens. We distribute small amounts of Base
            Sepolia ETH to developers for building and testing, at no cost.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">2. No Abuse: Compliant Accumulation</h2>
          <p>
            We take the integrity of Base testnet resources seriously. Pipette does not abuse faucet systems or violate
            Base&apos;s policies.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Testnet accumulation.</strong> We obtain Base Sepolia ETH exclusively through Coinbase Developer
              Platform (CDP) faucet, which is intended for developer use. Our treasury is refilled automatically within
              CDP&apos;s rate limits and terms.
            </li>
            <li>
              <strong>Distribution.</strong> We distribute to developers who connect a wallet, link GitHub, and pass an
              anti-sybil check. Claims are limited to one per wallet every 24 hours, with tiered amounts based on
              developer reputation.
            </li>
            <li>
              <strong>No hoarding or resale.</strong> Testnet ETH is for building. We do not accumulate beyond what is
              needed to serve users, nor do we sell or monetize testnet tokens.
            </li>
          </ul>
          <p className="mt-4">
            Our approach aligns with Base&apos;s intent for testnet resources: supporting developers fairly and
            preventing abuse.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">3. Eligibility</h2>
          <p>
            To claim, you must connect a wallet, link GitHub, and meet our anti-sybil score thresholds. Users with low
            scores may be pending review or restricted. We reserve the right to block wallets that violate these terms
            or abuse the system.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">4. Testnet Only: No Value</h2>
          <p>
            Base Sepolia ETH has no monetary value. It is for testing only. Do not use it for any purpose other than
            development and experimentation on Base Sepolia.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">5. As-Is Service</h2>
          <p>
            Pipette is provided &quot;as is&quot;. We strive for uptime but do not guarantee availability. Use at your
            own risk.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-base-content mt-8 mb-3">6. Changes</h2>
          <p>We may update these terms. Continued use of the faucet after changes constitutes acceptance.</p>
        </section>
      </div>
    </div>
  );
}
