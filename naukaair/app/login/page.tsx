"use client";

import { useState } from "react";
import { Atom, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ok = await login(username);
    setLoading(false);

    if (ok) {
      window.location.href = "/";
    } else {
      setError("Login musi mieć 2–32 znaki (litery, cyfry, _)");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 ring-1 ring-sky-500/30">
            <Atom className="h-7 w-7 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            nauka<span className="text-sky-400">air</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Zaloguj się samym loginem — bez hasła. Statystyki są zapisywane globalnie.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm text-slate-300">
              Twój login
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="np. jan_kowalski"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-medium text-white transition-all hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" />
            {loading ? "Logowanie…" : "Wejdź"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          ~20 użytkowników — każdy login ma własne statystyki + ranking globalny
        </p>
      </Card>
    </div>
  );
}
