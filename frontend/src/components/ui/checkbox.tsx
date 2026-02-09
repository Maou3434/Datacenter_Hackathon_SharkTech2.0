"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-2 bg-[#160C28] data-[state=checked]:bg-[#2F4B26] data-[state=checked]:text-[#E1EFE6] data-[state=checked]:border-[#2F4B26] data-[state=checked]:shadow-[0_0_12px_rgba(47,75,38,0.5)] focus-visible:border-[#2F4B26] focus-visible:ring-[#2F4B26]/50 border-[#2F4B26]/40 size-4 shrink-0 shadow-sm transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#2F4B26] hover:bg-[#2F4B26]/10 hover:shadow-[0_0_8px_rgba(255,255,255,0.2)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
