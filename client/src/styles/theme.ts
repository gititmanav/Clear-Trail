/**
 * ClearTrail Design Tokens
 *
 * Single source of truth for design values used in JS/TS.
 * CSS values are defined in tailwind.config.ts — this file
 * provides the same values for use in Chart.js, dynamic
 * styles, or any JS-driven UI.
 */

export const colors = {
  brand: {
    50: "#EEF6FF",
    100: "#D9EAFF",
    200: "#BCDBFF",
    300: "#8EC5FF",
    400: "#59A3FF",
    500: "#3381FF",
    600: "#1B5FF5",
    700: "#144AE1",
    800: "#173DB6",
    900: "#193990",
  },
  success: { 50: "#ECFDF5", 500: "#10B981", 700: "#047857" },
  warning: { 50: "#FFFBEB", 500: "#F59E0B", 700: "#B45309" },
  danger: { 50: "#FEF2F2", 500: "#EF4444", 700: "#B91C1C" },
  surface: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
} as const;

export const chartColors = {
  income: colors.success[500],
  expense: colors.danger[500],
  balance: colors.brand[500],
  grid: colors.surface[200],
  label: colors.surface[500],
} as const;

export const SIDEBAR_WIDTH = 260;
export const TOPBAR_HEIGHT = 64;
