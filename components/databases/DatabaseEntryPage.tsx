"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { StatusBadge } from "@/components/databases/StatusBadge";
import type { EntryStatus } from "@/types/models";

type EntryData = {
  title: string;
  content: string;
  status: EntryStatus;
  properties: Record<string, string>;
  coverImage?: string;
  icon?: string;
};

type DatabaseEntryPageProps = {
  initialData: EntryData;
  propertyLabels: { key: string; label: string }[];
  backHref: string;
  backLabel: string;
  onSave: (data: Partial<EntryData>) => Promise<void>;
  onPropertyChange?: (key: string, value: string) => Promise<void>;
  onBack?: () => void;
};

export function DatabaseEntryPage({
  initialData,
  propertyLabels,
  backHref,
  backLabel,
  onSave,
  onPropertyChange,
  onBack,
}: DatabaseEntryPageProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [status, setStatus] = useState<EntryStatus>(initialData.status);
  const [properties, setProperties] = useState(initialData.properties);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(
    (data: Partial<EntryData>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void onSave(data);
      }, 800);
    },
    [onSave]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function handleBack() {
    if (onBack) onBack();
    else router.push(backHref);
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  }

  function handleContentChange(html: string) {
    setContent(html);
    debouncedSave({ content: html });
  }

  async function handleStatusChange(s: EntryStatus) {
    setStatus(s);
    await onSave({ status: s });
  }

  async function handlePropertyChange(key: string, value: string) {
    setProperties((prev) => ({ ...prev, [key]: value }));
    if (onPropertyChange) {
      await onPropertyChange(key, value);
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-16">
      {!onBack && (
        <div className="px-8 pt-4 sm:px-12">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </button>
        </div>
      )}

      <div className={`px-8 sm:px-12 ${onBack ? "mt-24" : "mt-6"}`}>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-transparent text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          placeholder="Untitled"
        />
      </div>

      {/* Properties - Notion-style vertical list */}
      <div className="mt-12 px-8 sm:px-12">
        <div className="space-y-2 border-b border-zinc-100 pb-10 dark:border-zinc-800/50">
          <div className="flex items-center gap-4 group">
            <span className="w-32 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              Grade
            </span>
            <div className="flex-1">
              <StatusBadge status={status} onChange={handleStatusChange} />
            </div>
          </div>
          {propertyLabels.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-4 group"
            >
              <span className="w-32 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                {label}
              </span>
              <input
                type="text"
                value={properties[key] || ""}
                onChange={(e) => handlePropertyChange(key, e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-1 -mx-1 rounded transition-colors"
                placeholder="Empty"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="mt-12 px-8 sm:px-12">
        <NoteEditor content={content} onChange={handleContentChange} />
      </div>
    </div>
  );
}
