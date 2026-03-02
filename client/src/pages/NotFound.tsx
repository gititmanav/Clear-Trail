import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex-center bg-surface-50">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-surface-300">404</h1>
        <p className="text-surface-600 mt-2 mb-6">
          This page doesn&apos;t exist.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-md hover:bg-brand-600 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
