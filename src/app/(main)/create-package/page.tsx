// src/app/(main)/create-package/page.tsx
'use client';
import PackageForm from '@/components/packages/PackageForm';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreatePackagePage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Client-side check, Zustand state might take a moment to hydrate
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!isAuthenticated && !storedToken) {
            router.replace('/auth/login?redirect=/create-package');
        }
    }, [isAuthenticated, router]);

    // Avoid rendering form if not authenticated, useEffect will redirect
    if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('authToken')) {
        return <p className="text-center py-10">Redirecting to login...</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-center">Create a New Package</h1>
            <PackageForm />
        </div>
    );
}