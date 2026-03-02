import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
  });
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await register(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 mb-6">
        Create your account
      </h2>

      <form onSubmit={handleSubmit} className="flex-stack" style={{ gap: "1rem" }}>
        <div>
          <label htmlFor="name" className="text-label block mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="form-control"
            placeholder="Manav Kaneria"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="text-label block mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="form-control"
            placeholder="you@company.com"
            required
          />
        </div>

        <div>
          <label htmlFor="companyName" className="text-label block mb-1.5">
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            value={form.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            className="form-control"
            placeholder="Your business name"
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
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className="form-control"
            placeholder="Min 8 characters"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-brand-500 text-white text-sm font-medium rounded-md hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-surface-500 text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-500 font-medium hover:text-brand-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
