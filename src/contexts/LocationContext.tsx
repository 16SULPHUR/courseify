// contexts/LocationContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Country, countries, getCountryNameByCode } from '@/lib/countries'; // Import from your countries list

const DEFAULT_LOCATION_CODE = "GLOBAL"; // Default to USD or your base currency

interface LocationState {
  selectedCountry: Country | null; // Store the full country object
  setSelectedLocation: (countryCode: string) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const storedLocationCode = localStorage.getItem('userLocationPreference');
    let initialCountry: Country | undefined;

    if (storedLocationCode) {
      initialCountry = countries.find(c => c.code === storedLocationCode);
    }
    // If no stored preference or invalid code, try to find GLOBAL or the first country
    if (!initialCountry) {
      initialCountry = countries.find(c => c.code === DEFAULT_LOCATION_CODE) || countries[0];
    }

    setSelectedCountry(initialCountry || null);
    setIsLoading(false);
  }, []);

  const setSelectedLocation = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      localStorage.setItem('userLocationPreference', country.code);
    } else if (countryCode === DEFAULT_LOCATION_CODE) { // Handle resetting to Global
        const globalDefault = countries.find(c => c.code === DEFAULT_LOCATION_CODE);
        setSelectedCountry(globalDefault || null);
        localStorage.setItem('userLocationPreference', DEFAULT_LOCATION_CODE);
    }
  };

  return (
    <LocationContext.Provider value={{ selectedCountry, setSelectedLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationState => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};