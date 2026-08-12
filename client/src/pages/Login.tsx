import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !pin) return;
    setBusy(true);
    setError("");
    try {
      await login(pin);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPin("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-rose-100 via-stone-50 to-rose-100 px-6">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-rose-200/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-3xl">
            📌
          </div>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Pinbook</h1>
          <p className="mt-1 text-sm text-stone-500">
            For lalab's documentation links, pinned in one place. ❤️
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              maxLength={8}
              placeholder="Enter PIN"
              aria-label="PIN"
              className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-center text-lg tracking-[0.5em] outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
            />
            {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={busy || !pin}
              className="w-full rounded-full bg-rose-400 py-3 font-semibold text-white shadow-lg shadow-rose-200 transition active:scale-[0.98] disabled:opacity-40"
            >
              {busy ? "Checking…" : "Open directory"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
