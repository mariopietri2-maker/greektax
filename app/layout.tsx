import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "greek"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GreekTax — Απλοποίησε τους φόρους σου",
  description:
    "Δωρεάν υπολογιστές φόρων για μισθωτούς, ελεύθερους επαγγελματίες, επιχειρήσεις και ενοίκια. ΦΠΑ, καθαρός μισθός, τεκμαρτό εισόδημα και περισσότερα.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" className={`${inter.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}