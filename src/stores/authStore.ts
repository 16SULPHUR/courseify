// src/stores/authStore.ts
import {create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IUser } from '@/lib/types';

interface AuthState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    setUser: (user: IUser | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setUser: (user) => set((state) => ({ ...state, user, isAuthenticated: !!user })),
            setToken: (token) => {
                set((state) => ({ ...state, token, isAuthenticated: !!(state.user && token) }));
                if (typeof window !== 'undefined' && token) {
                    localStorage.setItem('authToken', token); // Also store in LS for direct access in api.ts
                } else if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                }
            },
            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                }
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            // Only persist token, user can be re-fetched or derived
            // For this example, we persist user and token for simplicity on hydration
            // A more robust approach might only persist the token and re-verify/fetch user on app load
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Ensure localStorage is updated if Zustand initializes from its own persisted state
                    if (state.token && typeof window !== 'undefined') {
                        localStorage.setItem('authToken', state.token);
                    }
                     // Re-validate isAuthenticated based on hydrated token and user
                    state.isAuthenticated = !!(state.user && state.token);
                }
            }
        }
    )
);

// Initialize auth state from localStorage on client-side load (important for SSR/hydration)
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    // You might want to fetch user details here if only token is stored,
    // or assume the persisted user from Zustand is fine for initial render.
    // For now, we rely on Zustand's own persistence logic for user.
    if (token && !useAuthStore.getState().token) {
         // This part can be tricky with persist middleware.
         // The persist middleware should handle rehydration.
         // If token exists in LS but not in store, set it.
         // This helps if persist middleware hasn't run yet or if LS was set externally.
         // useAuthStore.getState().setToken(token); // This might cause loop with persist
         // It's generally better to let persist handle rehydration.
    }
}