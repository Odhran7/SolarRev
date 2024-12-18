"use client";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxWithTextProps {
  title: string;
  onCheckedChange: (checked: boolean) => void;
}

export function CheckboxWithText({ title, onCheckedChange }: CheckboxWithTextProps) {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox 
        id="checkbox-custom"
        onCheckedChange={onCheckedChange}
      />
      <label
        htmlFor="checkbox-custom"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {title}
      </label>
    </div>
  );
}