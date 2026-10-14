import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "L'Étoile Royale — Haute Gastronomie & Fine Dining Experience",
  description: "Restoran Bintang Lima berstandar Michelin 3-Star dengan sistem reservasi terpadu, POS terminal, dan manajemen restoran.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#0a0c10] text-slate-100 antialiased selection:bg-amber-500 selection:text-black"
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
