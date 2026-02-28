"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), message: message.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setSent(true);
      setEmail("");
      setMessage("");
    } catch {
      setError("Failed to send. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] max-w-2xl mx-auto px-4 py-12 bg-base-200">
        <h1 className="text-2xl font-bold text-base-content mb-6">Support</h1>
        <div className="rounded-xl border border-base-300 bg-base-100 p-6">
          <p className="text-base-content/80">
            Thanks for reaching out. We have received your message and will get back to you at the email you provided.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 btn btn-primary btn-sm"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto px-4 py-12 bg-base-200">
      <h1 className="text-2xl font-bold text-base-content mb-6">Support</h1>
      <p className="text-base-content/80 mb-8">
        Need help with the faucet, claiming testnet ETH, or linking your GitHub? Send your email and message below and
        we will get back to you.
      </p>
      <form onSubmit={handleSubmit} className="rounded-xl border border-base-300 bg-base-100 p-6 space-y-4">
        <div>
          <label htmlFor="support-email" className="block text-sm font-medium text-base-content mb-1">
            Email
          </label>
          <input
            id="support-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="input input-bordered w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="support-message" className="block text-sm font-medium text-base-content mb-1">
            Message
          </label>
          <textarea
            id="support-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe your question or issue..."
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            className="textarea textarea-bordered w-full"
            disabled={loading}
          />
          <p className="text-xs text-base-content/60 mt-1">
            {message.length} / 5000 characters (min 10)
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
