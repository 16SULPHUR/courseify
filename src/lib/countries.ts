export interface Country {
  code: string; 
  name: string;
  currency: string; 
}

export const countries: Country[] = [
  { code: "DF", name: "Default USD", currency: "USD" }, 
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