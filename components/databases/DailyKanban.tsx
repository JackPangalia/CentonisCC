"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageCoverBanner } from "@/components/ui/PageCoverBanner";
import { Check, Plus, AlertCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import {
  createDailyTask,
  archiveDailyTask,
  getDailyTask,
  listDailyTasks,
  updateDailyTask,
  updateDailyTaskStatus,
} from "@/services/dailyTaskService";
import { listWorkspaceMembers } from "@/services/workspaceService";
import { SidePeek } from "@/components/ui/SidePeek";
import type { EntryStatus } from "@/types/models";
import { DailyTaskPage } from "@/components/databases/DailyTaskPage";
import type { DailyTask, WorkspaceMember } from "@/types/models";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function TaskCard({
  task,
  onToggleStatus,
  onOpenPeek,
  onArchive,
}: {
  task: DailyTask;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onOpenPeek: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  const isDone = task.status === "done";
  const isOverdue = !isDone && task.date < todayIso();

  return (
    <div
      className={`group flex items-start gap-2 sm:gap-2.5 rounded-lg border px-3 py-2.5 sm:py-2.5 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors ${
        isDone
          ? "opacity-50 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50"
          : isOverdue
            ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20"
            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50"
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStatus(task.id, task.status); }}
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors touch-manipulation mt-0.5 ${
          isDone
            ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 text-white dark:text-zinc-900"
            : "border-zinc-300 dark:border-zinc-600 bg-transparent hover:border-zinc-400 dark:hover:border-zinc-500"
        }`}
        aria-label={isDone ? "Mark as not done" : "Mark as done"}
      >
        {isDone && <Check className="h-3 w-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenPeek(task.id); }}
          className={`w-full text-left text-sm whitespace-normal break-words transition-colors cursor-pointer hover:underline ${
            isDone
              ? "text-zinc-400 dark:text-zinc-500 line-through"
              : "text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {task.title || "Untitled task"}
        </button>
        {isOverdue && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3 text-red-400 dark:text-red-500 shrink-0" />
            <span className="text-[10px] font-medium text-red-400 dark:text-red-500">Overdue</span>
          </div>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onArchive(task.id); }}
        className="opacity-0 group-hover:opacity-100 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-all shrink-0 p-1 -m-1 mt-0.5 touch-manipulation"
        aria-label="Remove task"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Column({
  userEmail,
  userId,
  tasks,
  onAdd,
  onToggleStatus,
  onOpenPeek,
  onNewDay,
  onArchive,
}: {
  userEmail: string;
  userId: string;
  tasks: DailyTask[];
  onAdd: (userId: string, title: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onOpenPeek: (id: string) => void;
  onNewDay: (userId: string) => void;
  onArchive: (id: string) => void;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  function handleAddSubmit() {
    const t = newTaskTitle.trim();
    if (!t) {
      setIsAdding(false);
      return;
    }
    onAdd(userId, t);
    setNewTaskTitle("");
  }

  return (
    <div
      className="flex flex-col rounded-xl bg-white dark:bg-[#191919] transition-all"
    >
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {userEmail.split("@")[0]}
          </h3>
          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 tabular-nums shrink-0">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onNewDay(userId)}
          disabled={tasks.length === 0}
          className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
          aria-label="Clear all tasks for this column"
        >
          Clear all
        </button>
      </div>

      <div className="flex-1 space-y-1.5 px-3 pb-3 flex flex-col min-h-0">
          {tasks.length === 0 && !isAdding ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-300 dark:text-zinc-700">
              <p className="text-xs text-zinc-400 dark:text-zinc-600">No tasks yet</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onOpenPeek={onOpenPeek}
                onArchive={onArchive}
              />
            ))
          )}

        <div className="mt-auto pt-1.5 shrink-0">
          {isAdding ? (
            <input
              autoFocus
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubmit();
                if (e.key === "Escape") { setIsAdding(false); setNewTaskTitle(""); }
              }}
              onBlur={handleAddSubmit}
              placeholder="Task name…"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:border-zinc-300 dark:focus:border-zinc-600 transition-colors touch-manipulation min-h-[40px] sm:min-h-0"
            />
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors text-sm touch-manipulation"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Add task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DailyKanban() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const peekId = searchParams.get("peek");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [date, setDate] = useState(todayIso());
  const [peekTask, setPeekTask] = useState<DailyTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const [items, wsMembers] = await Promise.all([
      listDailyTasks(workspaceId, date),
      listWorkspaceMembers(workspaceId),
    ]);
    
    // Sort members to put the current user first
    const sortedMembers = [...wsMembers].sort((a, b) => {
      if (a.userId === user?.uid) return -1;
      if (b.userId === user?.uid) return 1;
      return a.userEmail.localeCompare(b.userEmail);
    });
    
    setMembers(sortedMembers);
    setTasks(items);
    setIsLoading(false);
  }, [workspaceId, date, user?.uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (peekId) {
      getDailyTask(peekId).then((data) => {
        if (data) setPeekTask(data);
        else setPeekTask(null);
      });
    } else {
      setPeekTask(null);
    }
  }, [peekId]);

  function closePeek() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("peek");
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
  }

  function openPeek(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("peek", id);
    router.replace(`${pathname}?${params}`);
  }

  function openFullPage(id: string) {
    router.push(`/daily/${id}`);
  }

  async function handleAdd(userId: string, title: string) {
    if (!workspaceId || !title.trim()) return;
    const now = new Date().toISOString();
    const taskId = await createDailyTask(workspaceId, userId, {
      title: title.trim(),
      date,
    });
    const optimisticTask: DailyTask = {
      id: taskId,
      workspaceId,
      createdByUserId: userId,
      title: title.trim(),
      description: "",
      status: "not_started",
      date,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [...prev, optimisticTask]);
  }


  async function handleNewDay(columnUserId: string) {
    const columnTasks = tasks.filter(
      (t) => t.createdByUserId === columnUserId && t.date === date
    );
    if (columnTasks.length === 0) return;
    const archivedIds = new Set(columnTasks.map((t) => t.id));
    await Promise.all(columnTasks.map((task) => archiveDailyTask(task.id)));
    setTasks((prev) => prev.filter((t) => !archivedIds.has(t.id)));
    if (peekId && archivedIds.has(peekId)) closePeek();
  }

  async function handleArchiveSingle(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (peekId === id) closePeek();
    await archiveDailyTask(id);
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "done" ? "not_started" : "done";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus as EntryStatus } : t))
    );
    await updateDailyTaskStatus(id, newStatus as EntryStatus);
  }

  return (
    <div className="pb-24 sm:pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <PageCoverBanner pageKey="daily" className="mb-6" />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 mt-2">
          <div className="min-w-0">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Daily Tasks
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              See what everyone is working on today
            </p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-auto sm:min-w-[160px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors touch-manipulation"
          />
        </div>

      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-6 px-4 sm:px-8 sm:max-w-6xl sm:mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[300px] sm:min-w-[340px] max-w-[420px] flex-shrink-0 h-[280px] rounded-xl bg-zinc-100 dark:bg-zinc-800/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 items-start px-4 sm:px-8 sm:max-w-6xl sm:mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain">
          {members.map((member) => (
            <div key={member.userId} className="min-w-[300px] sm:min-w-[340px] max-w-[420px] flex-shrink-0">
              <Column
                userEmail={member.userEmail}
                userId={member.userId}
                tasks={tasks.filter((t) => t.createdByUserId === member.userId)}
                onAdd={handleAdd}
                onToggleStatus={handleToggleStatus}
                onOpenPeek={openPeek}
                onNewDay={handleNewDay}
                onArchive={handleArchiveSingle}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <SidePeek
          isOpen={!!peekId}
          onClose={closePeek}
          onOpenFullPage={() => peekId && openFullPage(peekId)}
        >
          {peekTask && (
            <DailyTaskPage
              initialData={{
                title: peekTask.title,
                description: peekTask.description ?? "",
                status: peekTask.status,
                date: peekTask.date,
              }}
              backHref="/daily"
              backLabel="Back to Daily"
              onSave={async (data) => {
                if (!peekTask) return;
                await updateDailyTask(peekTask.id, data);
                setPeekTask((p) => (p ? { ...p, ...data } : null));
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === peekTask.id ? { ...t, ...data } : t
                  )
                );
              }}
              onBack={closePeek}
            />
          )}
        </SidePeek>
      </div>
    </div>
  );
}
