"use client";

import { CheckCircle, Circle } from "lucide-react";

type Step = "wallet" | "github" | "claim";

type Props = {
  walletConnected: boolean;
  githubLinked: boolean;
  canClaim: boolean;
};

export function FaucetSteps({ walletConnected, githubLinked, canClaim }: Props) {
  const steps: { id: Step; label: string; done: boolean }[] = [
    { id: "wallet", label: "Connect wallet", done: walletConnected },
    { id: "github", label: "Link GitHub", done: githubLinked },
    { id: "claim", label: "Sign & claim", done: canClaim },
  ];

  return (
    <nav aria-label="Faucet steps" className="flex items-center justify-center gap-2 sm:gap-4 py-4">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
              step.done
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-base-300 text-base-content/40"
            }`}
          >
            {step.done ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          </div>
          <span
            className={`text-sm font-medium hidden sm:inline ${step.done ? "text-base-content" : "text-base-content/70"}`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && <div className="w-4 h-0.5 bg-base-300 mx-1 sm:mx-2" aria-hidden />}
        </div>
      ))}
    </nav>
  );
}
