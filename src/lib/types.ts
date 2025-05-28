// src/lib/types.ts
export interface IUser {
    _id: string; // Mongoose ID
    userId: string; // Custom UUID
    name: string;
    email: string;
    phone: string;
    location?: string;
    profileImage?: string;
    createdAt: string; // Date as string
}

export interface LocalizedPriceInfo {
    originalPriceUSD: number;
    originalCurrency: string; // Should be USD
    localizedPrice?: number;
    localizedCurrency?: string;
    appliedMultiplier?: number;
    conversionRate?: number;
    message?: string;
    isBlacklisted?: boolean;
}

export interface ICourse {
    _id: string; // Mongoose ID
    courseId: string; // Custom UUID
    title: string;
    description?: string;
    price: number; // base in USD
    image?: string;
    creatorId: IUser | string; // Can be populated or just ID string
    createdAt: string; // Date as string
    localizedPriceInfo?: LocalizedPriceInfo; // Added by frontend/backend for display
}

export interface IPackage {
    _id: string; // Mongoose ID
    packageId: string; // Custom UUID
    title: string;
    courses: ICourse[] | string[]; // Can be populated or array of IDs
    creatorId: IUser | string;
    image?: string;
    createdAt: string;
    baseTotalPriceUSD?: number; // Calculated for display
    localizedPriceInfo?: LocalizedPriceInfo; // Added by frontend/backend for display
}

export interface AuthResponse {
    status: string;
    token: string;
    data: {
        user: IUser;
    };
}

export interface ApiErrorResponse {
    status: string;
    message: string;
    errors?: Array<{ path: string, message: string }>; // For Zod validation errors
}