export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-12">
      {/* Background mesh pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(51,129,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(51,129,255,0.06) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(20,74,225,0.05) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 6v12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16 6l-4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-900">
            ClearTrail
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Financial Operations Platform
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-xl border border-surface-200 bg-white/80 p-8 shadow-card backdrop-blur-sm">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-surface-400">
          &copy; {new Date().getFullYear()} ClearTrail. All rights reserved.
        </p>
      </div>
    </div>
  );
}
