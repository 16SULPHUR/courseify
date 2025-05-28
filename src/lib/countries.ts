// lib/countries.ts
export interface Country {
  code: string; // e.g., "US", "IN", "GB" (ISO 3166-1 alpha-2 codes are good)
  name: string; // e.g., "United States", "India", "United Kingdom"
  currency: string; // e.g., "USD", "INR", "GBP" (Optional, can be derived or for display)
  // The `code` will be sent to the backend's `location` parameter.
  // The backend's `countryToCurrencyMap` should use these codes or names.
  // For simplicity, let's assume the backend's `pricingService` uses the `name` (uppercased)
  // or you adapt the backend to use these codes.
}

export const countries: Country[] = [
  { code: "IN", name: "Default INR", currency: "INR" }, 
  { code: "US", name: "United States", currency: "USD" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "JP", name: "Japan", currency: "JPY" },
];

// Helper to get country name by code
export const getCountryNameByCode = (code: string): string | undefined => {
  return countries.find(c => c.code === code)?.name;
}