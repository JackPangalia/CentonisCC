"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { StatusBadge } from "@/components/databases/StatusBadge";
import type { EntryStatus } from "@/types/models";

type TaskData = {
  title: string;
  description: string;
  status: EntryStatus;
  date: string;
};

type DailyTaskPageProps = {
  initialData: TaskData;
  backHref: string;
  backLabel: string;
  onSave: (data: Partial<TaskData>) => Promise<void>;
  onBack?: () => void;
};

export function DailyTaskPage({
  initialData,
  backHref,
  backLabel,
  onSave,
  onBack,
}: DailyTaskPageProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [status, setStatus] = useState<EntryStatus>(initialData.status);
  const [date, setDate] = useState(initialData.date);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(
    (data: Partial<TaskData>) => {
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
    setDescription(html);
    debouncedSave({ description: html });
  }

  async function handleStatusChange(s: EntryStatus) {
    setStatus(s);
    await onSave({ status: s });
  }

  async function handleDateChange(newDate: string) {
    setDate(newDate);
    await onSave({ date: newDate });
  }

  return (
    <div className="mx-auto max-w-5xl pb-16 sm:pb-24">
      {!onBack && (
        <div className="px-4 pt-4 sm:px-8 md:px-12">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors py-2 -my-2 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {backLabel}
          </button>
        </div>
      )}

      <div className={`px-4 sm:px-8 md:px-12 ${onBack ? "mt-20 sm:mt-24 pt-2" : "mt-6"}`}>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-transparent text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          placeholder="Untitled task"
        />
      </div>

      <div className="mt-8 sm:mt-12 px-4 sm:px-8 md:px-12">
        <div className="space-y-4 sm:space-y-2 border-b border-zinc-100 pb-8 sm:pb-10 dark:border-zinc-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="w-full sm:w-32 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              Status
            </span>
            <div className="flex-1 w-full">
              <StatusBadge status={status} onChange={handleStatusChange} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="w-full sm:w-32 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              tabIndex={-1}
              className="flex-1 min-w-0 w-full bg-transparent text-base sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 py-2 sm:py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 -mx-2 sm:px-1 sm:-mx-1 rounded transition-colors touch-manipulation border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 sm:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 px-4 sm:px-8 md:px-12">
        <NoteEditor content={description} onChange={handleContentChange} />
      </div>
    </div>
  );
}
