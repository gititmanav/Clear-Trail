"use client";

import * as React from "react";
import { ChevronRight, FolderTree, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GroupData {
  id: string;
  name: string;
  parentId: string | null;
  nature: string;
  isPrimary: boolean | null;
  ledgerCount: number;
  sortOrder: number | null;
}

interface GroupTreeClientProps {
  groups: GroupData[];
}

const natureColors: Record<string, string> = {
  assets: "bg-blue-50 text-blue-700 border-blue-200",
  liabilities: "bg-purple-50 text-purple-700 border-purple-200",
  income: "bg-green-50 text-green-700 border-green-200",
  expenses: "bg-orange-50 text-orange-700 border-orange-200",
};

export function GroupTreeClient({ groups }: GroupTreeClientProps) {
  // Build tree structure
  const childrenMap = new Map<string | null, GroupData[]>();

  for (const g of groups) {
    const parentKey = g.parentId;
    if (!childrenMap.has(parentKey)) {
      childrenMap.set(parentKey, []);
    }
    childrenMap.get(parentKey)!.push(g);
  }

  const rootGroups = childrenMap.get(null) ?? [];

  return (
    <div className="rounded-lg border border-surface-200 bg-white divide-y divide-surface-100">
      {rootGroups.map((group) => (
        <GroupTreeNode
          key={group.id}
          group={group}
          childrenMap={childrenMap}
          depth={0}
        />
      ))}
    </div>
  );
}

function GroupTreeNode({
  group,
  childrenMap,
  depth,
}: {
  group: GroupData;
  childrenMap: Map<string | null, GroupData[]>;
  depth: number;
}) {
  const [open, setOpen] = React.useState(depth === 0);
  const children = childrenMap.get(group.id) ?? [];

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 px-3 py-2.5 hover:bg-surface-50 transition-colors cursor-default",
          depth === 0 && "bg-surface-50/30"
        )}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {children.length > 0 ? (
          <button
            onClick={() => setOpen(!open)}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-surface-200 transition-colors"
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-surface-400 transition-transform",
                open && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="w-5" />
        )}

        <FolderTree className="h-4 w-4 text-surface-400 shrink-0" />

        <span
          className={cn(
            "flex-1 text-sm",
            depth === 0
              ? "font-semibold text-surface-900"
              : "text-surface-700"
          )}
        >
          {group.name}
        </span>

        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-1.5 capitalize",
            natureColors[group.nature]
          )}
        >
          {group.nature}
        </Badge>

        {group.ledgerCount > 0 && (
          <span className="text-xs text-surface-400 tabular-nums min-w-[3ch] text-right">
            {group.ledgerCount}
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          asChild
        >
          <Link href={`/groups/new?parentId=${group.id}`}>
            <Plus className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {open &&
        children.map((child) => (
          <GroupTreeNode
            key={child.id}
            group={child}
            childrenMap={childrenMap}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}
