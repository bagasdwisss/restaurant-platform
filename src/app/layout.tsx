import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "SAVORIA — Modern Gourmet Dining & Restaurant Experience",
  description: "Modern Gourmet Dining Restaurant with integrated table reservations, smart POS terminal, and kitchen management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#FDFBF7] text-[#18181B] antialiased selection:bg-[#EA580C] selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
