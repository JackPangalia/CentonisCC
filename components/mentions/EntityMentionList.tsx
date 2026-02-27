import type { FC } from "react";

export type EntityMentionItem = {
  id: string;
  label: string;
  href: string;
  type: "note" | "goal";
};

type EntityMentionListProps = {
  items: EntityMentionItem[];
  command: (item: EntityMentionItem) => void;
  selectedIndex: number;
};

export const EntityMentionList: FC<EntityMentionListProps> = ({
  items,
  command,
  selectedIndex,
}) => {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 shadow-lg">
        No matches
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-1 shadow-lg min-w-[220px]">
      {items.map((item, index) => (
        <button
          key={`${item.type}-${item.id}`}
          type="button"
          className={`flex w-full items-center justify-between px-3 py-1.5 text-xs ${
            index === selectedIndex
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          }`}
          onClick={() => command(item)}
        >
          <span className="truncate">
            {item.label}
          </span>
          <span className="ml-2 text-[10px] uppercase tracking-wide text-zinc-400">
            {item.type}
          </span>
        </button>
      ))}
    </div>
  );
};

