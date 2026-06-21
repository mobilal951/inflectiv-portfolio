"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Property {
  id: string;
  name: string;
  account: string;
}

interface PropertySelectorProps {
  properties: Property[];
  value: string | null;
  onChange: (propertyId: string) => void;
  loading?: boolean;
}

export function PropertySelector({
  properties,
  value,
  onChange,
  loading,
}: PropertySelectorProps) {
  const selected = properties.find((p) => p.id === value);

  if (loading) {
    return (
      <Button variant="outline" disabled className="w-full sm:w-[280px] text-xs sm:text-sm h-8 sm:h-9">
        <Building2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="truncate">Loading...</span>
      </Button>
    );
  }

  if (properties.length === 0) {
    return (
      <Button variant="outline" disabled className="w-full sm:w-[280px] text-xs sm:text-sm h-8 sm:h-9">
        <Building2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="truncate">No properties</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-[280px] justify-between text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
          <div className="flex items-center min-w-0">
            <Building2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">
              {selected?.name || "Select property"}
            </span>
          </div>
          <ChevronsUpDown className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[calc(100vw-24px)] sm:w-[280px] max-w-[280px]">
        {properties.map((property) => (
          <DropdownMenuItem
            key={property.id}
            onClick={() => onChange(property.id)}
            className="cursor-pointer text-xs sm:text-sm"
          >
            <Check
              className={cn(
                "mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4",
                value === property.id ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="flex flex-col min-w-0">
              <span className="truncate">{property.name}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {property.account}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
