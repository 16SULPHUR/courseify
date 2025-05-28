// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
// import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { LocationProvider } from "@/contexts/LocationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Courseify Frontend",
  description: "Manage your courses with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // NO extra spaces or newlines directly here before <head> or <body>
    <html lang="en" suppressHydrationWarning>
      {/* Any comments should be HTML comments <!-- like this --> if inside <html> directly */}
      <head>
        {/* Head elements go here, Next.js manages some of these automatically */}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LocationProvider>
            <Header />
            <main className="container mx-auto py-8 px-4 md:px-6">{children}</main>
            {/* <Toaster /> */}
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
    // NO extra spaces or newlines here either
  );
}