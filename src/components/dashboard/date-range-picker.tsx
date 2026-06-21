"use client";

import * as React from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

const presets = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    onChange({ from, to });
    setOpen(false);
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!value?.from) return "Select dates";
    if (!value.to) return format(value.from, "MMM d, y");
    // Shorter format for mobile
    return `${format(value.from, "MMM d, y")} - ${format(value.to, "MMM d, y")}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-[280px] md:w-[320px] justify-start text-left font-normal text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
          <span className="truncate">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 max-w-[calc(100vw-24px)]"
        align="end"
        sideOffset={4}
      >
        {/* Mobile Layout - Stacked */}
        <div className="sm:hidden">
          <div className="flex border-b p-2 gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.days}
                variant="ghost"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => handlePreset(preset.days)}
              >
                {preset.label.replace("Last ", "")}
              </Button>
            ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={1}
            className="p-2"
          />
        </div>

        {/* Desktop Layout - Side by side */}
        <div className="hidden sm:flex">
          <div className="border-r p-3 space-y-1">
            {presets.map((preset) => (
              <Button
                key={preset.days}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handlePreset(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
