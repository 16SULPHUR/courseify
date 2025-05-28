// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, UserCircle, LayoutDashboard, PlusCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function Navbar() {
    // Use a state that updates on mount to avoid hydration mismatch for auth state
    const [isMounted, setIsMounted] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        // Re-initialize store from localStorage if it wasn't correctly hydrated
        // This is a common pattern to ensure client-side state is up-to-date
        const token = localStorage.getItem('authToken');
        if (token && !isAuthenticated) {
             // Potentially re-fetch user or trust persisted data
             // useAuthStore.getState().setToken(token);
             // If user data is also in localStorage via persist, it should be fine
        }
    }, [isAuthenticated]);


    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    if (!isMounted) {
        return ( // Return a placeholder or null during server render / pre-hydration
            <header className="bg-background border-b sticky top-0 z-50">
                <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        Courseify
                    </Link>
                    <div className="animate-pulse h-8 w-24 bg-muted rounded"></div> {/* Placeholder */}
                </nav>
            </header>
        );
    }

    return (
        <header className="bg-background/95 backdrop-blur border-b sticky top-0 z-50">
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-primary">
                    Courseify
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/courses">
                        <Button variant="ghost">Courses</Button>
                    </Link>
                    <Link href="/packages">
                        <Button variant="ghost">Packages</Button>
                    </Link>
                    {isAuthenticated && user ? (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                                        <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/create-course')}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    <span>Create Course</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/create-package')}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    <span>Create Package</span>
                                </DropdownMenuItem>
                                 {/* Add more items like My Courses, Profile Settings etc. */}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/auth/login">
                            <Button>Login</Button>
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}