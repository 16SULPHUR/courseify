// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export interface Course {
  _id: string; // Mongoose ID
  courseId: string; // Custom UUID
  title: string;
  description?: string;
  price: number; // Base price in USD
  image?: string;
  creatorId: { // Assuming it's populated
    _id: string;
    userId: string;
    name: string;
    email: string;
  } | string; // Can be just ObjectId string if not populated
  createdAt: Date;
  updatedAt?: Date;
  localizedPriceInfo?: { // From your backend's pricingService
    originalPriceUSD: number;
    originalCurrency: string;
    localizedPrice?: number;
    localizedCurrency?: string;
    appliedMultiplier?: number;
    conversionRate?: number;
    message?: string;
    isBlacklisted?: boolean;
  };
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
  price: number;
  image?: string;
  // creatorId will be handled by the backend using the JWT token
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {}


export const fetchAllCourses = async (location?: string): Promise<Course[]> => {
  const params = location ? { location } : {};
  const response = await apiClient.get('/courses', { params });
  return response.data.data; // Assuming your backend returns { status: 'success', results: ..., data: [...] }
};

export const fetchCourseById = async (courseId: string, location?: string): Promise<Course> => {
  const params = location ? { location } : {};
  const response = await apiClient.get(`/courses/${courseId}`, { params });
  return response.data.data;
};

// For logged-in users to manage their courses
export const fetchMyCourses = async (location?: string): Promise<Course[]> => {
  const params = location ? { location } : {};
  const response = await apiClient.get('/courses/my-courses', { params });
  return response.data.data;
};


export const createCourse = async (payload: CreateCoursePayload): Promise<Course> => {
  const response = await apiClient.post('/courses', payload);
  return response.data.data;
};

export const updateCourse = async (courseId: string, payload: UpdateCoursePayload): Promise<Course> => {
  // Note: The backend expects the Mongoose _id or the custom courseId depending on your route definition.
  // Your backend uses courseId (custom string ID) in the URL for PUT /courses/:courseId
  const response = await apiClient.put(`/courses/${courseId}`, payload);
  return response.data.data;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  // Same as update, uses custom courseId in URL
  await apiClient.delete(`/courses/${courseId}`);
};


export interface PackageCourseMinimal { // For display within a package
  _id: string;
  courseId: string;
  title: string;
  price: number; // Base USD price
  image?: string;
}

export interface Package {
  _id: string; // Mongoose ID
  packageId: string; // Custom UUID
  title: string;
  courses: PackageCourseMinimal[] | string[]; // Can be populated or just ObjectIds
  creatorId: { // Assuming it's populated
    _id: string;
    userId: string;
    name: string;
    email: string;
  } | string;
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
  baseTotalPriceUSD?: number; // Calculated on backend or frontend
  localizedPriceInfo?: { // From your backend's pricingService for the total package
    originalPriceUSD: number;
    originalCurrency: string;
    localizedPrice?: number;
    localizedCurrency?: string;
    appliedMultiplier?: number;
    conversionRate?: number;
    message?: string;
    isBlacklisted?: boolean;
  };
}

export interface CreatePackagePayload {
  title: string;
  courseIds: string[]; // Array of Mongoose ObjectIds of courses
  image?: string;
  // creatorId will be handled by the backend using JWT
}

export interface UpdatePackagePayload {
  title?: string;
  image?: string;
  // Updating courseIds in a package (add/remove) is more complex.
  // For simplicity, this example won't handle adding/removing courses from an existing package
  // through the generic update. You'd typically have dedicated endpoints for that.
}

export const fetchAllPackages = async (location?: string): Promise<Package[]> => {
  const params = location ? { location } : {};
  const response = await apiClient.get('/packages', { params });
  // Ensure your backend for GET /packages calculates and includes baseTotalPriceUSD and localizedPriceInfo
  return response.data.data;
};

export const fetchPackageById = async (packageId: string, location?: string): Promise<Package> => {
  const params = location ? { location } : {};
  const response = await apiClient.get(`/packages/${packageId}`, { params });
  // Backend for GET /packages/:packageId should also calculate and include pricing info
  return response.data.data;
};

// For logged-in users to manage their packages
export const fetchMyPackages = async (location?: string): Promise<Package[]> => {
  // ASSUMPTION: Backend route GET /packages/my-packages exists, is protected,
  // and accepts a location param to return localized total prices.
  const params = location ? { location } : {};
  const response = await apiClient.get('/packages/my-packages', { params });
  return response.data.data;
};

export const createPackage = async (payload: CreatePackagePayload): Promise<Package> => {
  // Backend route for create package is /packages/create
  const response = await apiClient.post('/packages/create', payload);
  return response.data.data;
};

export const updatePackage = async (packageId: string, payload: UpdatePackagePayload): Promise<Package> => {
  // Backend uses packageId (custom string ID) in URL
  const response = await apiClient.put(`/packages/${packageId}`, payload);
  return response.data.data;
};

export const deletePackage = async (packageId: string): Promise<void> => {
  await apiClient.delete(`/packages/${packageId}`);
};




export default apiClient;