"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setStatus(result.error);
        return;
      }

      window.location.href = "/admin";
    } catch (error) {
      setStatus("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--bg)]/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]/70">
              Admin Login
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">
              Chappell Hill Wine &amp; Spirits
            </h1>
          </div>
          <a
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
            href="/"
          >
            Back to Home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <h2 className="text-2xl font-semibold text-[color:var(--text)]">
            Admin sign in
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            This login is for store owners only.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
              placeholder="Email address"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
              placeholder="Password"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
            {status && (
              <p className="text-sm text-rose-600">{status}</p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
