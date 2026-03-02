import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 mb-6">
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit} className="flex-stack" style={{ gap: "1rem" }}>
        <div>
          <label htmlFor="email" className="text-label block mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            placeholder="you@company.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="text-label block mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-brand-500 text-white text-sm font-medium rounded-md hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-surface-500 text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-brand-500 font-medium hover:text-brand-600">
          Create one
        </Link>
      </p>
    </div>
  );
}
