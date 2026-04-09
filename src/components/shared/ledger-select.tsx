"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface LedgerOption {
  id: string;
  name: string;
  groupName: string;
  balance?: string;
}

interface LedgerSelectProps {
  ledgers: LedgerOption[];
  value: string;
  onChange: (ledgerId: string, ledgerName: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onCreateNew?: () => void;
  className?: string;
}

export function LedgerSelect({
  ledgers,
  value,
  onChange,
  placeholder = "Select ledger...",
  disabled = false,
  onCreateNew,
  className,
}: LedgerSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLedger = ledgers.find((l) => l.id === value);

  // Group ledgers by group name
  const grouped = React.useMemo(() => {
    const map = new Map<string, LedgerOption[]>();
    for (const ledger of ledgers) {
      const group = ledger.groupName || "Ungrouped";
      if (!map.has(group)) {
        map.set(group, []);
      }
      map.get(group)!.push(ledger);
    }
    return map;
  }, [ledgers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-surface-400",
            className
          )}
        >
          <span className="truncate">
            {selectedLedger ? selectedLedger.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search ledger..." />
          <CommandList>
            <CommandEmpty>No ledger found.</CommandEmpty>
            {Array.from(grouped.entries()).map(([groupName, groupLedgers]) => (
              <CommandGroup key={groupName} heading={groupName}>
                {groupLedgers.map((ledger) => (
                  <CommandItem
                    key={ledger.id}
                    value={`${ledger.name} ${groupName}`}
                    onSelect={() => {
                      onChange(ledger.id, ledger.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === ledger.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1 truncate">{ledger.name}</span>
                    {ledger.balance && (
                      <span className="ml-2 text-xs font-mono text-surface-400">
                        {ledger.balance}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            {onCreateNew && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onCreateNew();
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Ledger
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
