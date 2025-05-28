// app/page.tsx
"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PackageSearch } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center p-10">Loading user data...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Courseify!</h1>
      {isAuthenticated ? (
        <div>
          <p className="text-xl mb-2">Hello, {user?.name || user?.email}!</p>
          <p className="mb-6">You are logged in. Start managing your courses.</p>
          <Link href="/dashboard/my-courses" className="text-sm font-medium hover:underline underline-offset-4">
                  <Button variant="default" size="sm">
                    <LayoutDashboard className="mr-1 h-4 w-4" /> My Courses
                  </Button>
                </Link>

                 <Link href="/dashboard/my-packages" passHref><Button variant="default" size="sm"><PackageSearch className="mr-1 h-4 w-4" /> My Packages</Button></Link>
        </div>
      ) : (
        <div>
          <p className="text-xl mb-6">Please log in or register to continue.</p>
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}