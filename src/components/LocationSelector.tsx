// components/LocationSelector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/lib/countries";
import { useLocation } from "@/contexts/LocationContext";
import { Globe } from "lucide-react";

export default function LocationSelector() {
  const { selectedCountry, setSelectedLocation, isLoading } = useLocation();

  if (isLoading) {
    return <div className="w-[180px] h-9 bg-muted animate-pulse rounded-md"></div>; // Skeleton loader
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-muted-foreground hidden sm:inline-block" />
      <Select
        value={selectedCountry?.code || ""}
        onValueChange={(value) => setSelectedLocation(value)}
      >
        <SelectTrigger className="w-auto sm:w-[180px] text-sm">
          <SelectValue placeholder="Select Location" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name} ({country.currency})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}