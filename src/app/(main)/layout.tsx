// src/app/(main)/layout.tsx
import Navbar from "@/components/Navbar";
import React from "react";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="text-center py-4 border-t">
        © {new Date().getFullYear()} Courseify
      </footer>
    </div>
  );
}