// components/Header.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Home, LogIn, LogOut, UserPlus, UserCircle, BookOpen, BookMarked, LayoutDashboard, PackageSearch } from "lucide-react"; // Added BookOpen
import LocationSelector from "./LocationSelector";

export default function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header className="bg-background border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-6 w-6" /> {/* Changed Icon */}
            <span>Courseify</span>
          </Link>
          <div>Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold">Courseify</span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-2 sm:gap-4">
           {/* Location Selector on the left of auth buttons for larger screens */}
          <div className="hidden md:block">
            <LocationSelector />
          </div>

          <nav className="flex items-center gap-1 sm:gap-2"> {/* Reduced gap slightly */}
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              <Button variant="ghost" size="sm">
                <Home className="mr-1 h-4 w-4" /> Home
              </Button>
            </Link>
            <Link href="/courses" className="text-sm font-medium hover:underline underline-offset-4">
              <Button variant="ghost" size="sm">
                <BookMarked className="mr-1 h-4 w-4" /> Courses
              </Button>
            </Link>

            {isAuthenticated ? (
              // ... (authenticated user links - no change needed here for location selector)
               <>
                <Link href="/dashboard/my-courses" className="text-sm font-medium hover:underline underline-offset-4">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="mr-1 h-4 w-4" /> My Courses
                  </Button>
                </Link>

                 <Link href="/dashboard/my-packages" passHref><Button variant="ghost" size="sm"><PackageSearch className="mr-1 h-4 w-4" /> My Packages</Button></Link>
                <span className="text-sm hidden md:inline items-center">
                  <UserCircle className="inline mr-1 h-4 w-4" />
                  {user?.name || user?.email}
                </span>
                <Button onClick={logout} variant="outline" size="sm">
                  <LogOut className="mr-1 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              // ... (unauthenticated user links)
               <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="mr-1 h-4 w-4" /> Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm">
                    <UserPlus className="mr-1 h-4 w-4" /> Register
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      {/* Location Selector below header for smaller screens */}
      <div className="md:hidden p-2 border-t bg-background flex justify-center">
          <LocationSelector />
      </div>
    </header>

  );
}