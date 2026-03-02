import type { ReactNode, ElementType } from "react";

/* ── Variant Definitions ── */

const variants = {
  h1: { tag: "h1" as const, style: "font-display text-3xl font-bold tracking-tight text-surface-900" },
  h2: { tag: "h2" as const, style: "font-display text-2xl font-semibold tracking-tight text-surface-900" },
  h3: { tag: "h3" as const, style: "font-display text-xl font-semibold text-surface-900" },
  h4: { tag: "h4" as const, style: "font-display text-lg font-semibold text-surface-900" },
  body: { tag: "p" as const, style: "text-sm text-surface-700 leading-relaxed" },
  bodyLarge: { tag: "p" as const, style: "text-base text-surface-700 leading-relaxed" },
  caption: { tag: "p" as const, style: "text-xs text-surface-500" },
  label: { tag: "span" as const, style: "text-label text-surface-500" },
  code: { tag: "code" as const, style: "font-mono text-sm bg-surface-100 px-1.5 py-0.5 rounded text-surface-800" },
} as const;

/* ── Types ── */

export type TypographyVariant = keyof typeof variants;

interface TypographyProps {
  variant?: TypographyVariant;
  /** Override the HTML tag */
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

/* ── Component ── */

export default function Typography({
  variant = "body",
  as,
  children,
  className = "",
}: TypographyProps) {
  const { tag, style } = variants[variant];
  const Component = as || tag;

  return <Component className={`${style} ${className}`}>{children}</Component>;
}
