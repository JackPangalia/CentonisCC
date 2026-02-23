"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listGoals } from "@/services/goalService";
import { listTasksByWorkspace } from "@/services/taskService";
import { useAuth } from "@/hooks/useAuth";
import type { Goal, Task } from "@/types/models";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open && user) {
      // Fetch data when opened
      const fetchData = async () => {
        const [userGoals, userTasks] = await Promise.all([
          listGoals("personal", user.uid),
          listTasksByWorkspace("personal", user.uid),
        ]);
        setGoals(userGoals);
        setTasks(userTasks);
      };
      fetchData();
    }
  }, [open, user]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 p-2"
    >
      <div className="flex items-center border-b border-slate-100 px-3" cmdk-input-wrapper="">
        <span className="text-slate-400 mr-2">🔎</span>
        <Command.Input 
          placeholder="Search tasks, goals, or commands..." 
          className="w-full py-3 text-sm outline-none placeholder:text-slate-400 text-slate-800"
        />
      </div>
      
      <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden py-2 px-1 scroll-py-2">
        <Command.Empty className="py-6 text-center text-sm text-slate-500">
          No results found.
        </Command.Empty>

        <Command.Group heading="Navigation" className="text-xs font-semibold text-slate-500 px-2 py-1.5 mb-1">
          <Command.Item
            onSelect={() => runCommand(() => router.push("/dashboard"))}
            className="flex items-center gap-2 px-2 py-2 text-sm text-slate-700 rounded-md cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100"
          >
            🏠 Dashboard
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/teams"))}
            className="flex items-center gap-2 px-2 py-2 text-sm text-slate-700 rounded-md cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100"
          >
            👥 Teams
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Goals" className="text-xs font-semibold text-slate-500 px-2 py-1.5 mb-1 mt-2">
          {goals.map((goal) => (
            <Command.Item
              key={goal.id}
              onSelect={() => runCommand(() => router.push(`/goals/${goal.id}`))}
              className="flex items-center gap-2 px-2 py-2 text-sm text-slate-700 rounded-md cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100"
            >
              🎯 {goal.title}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Tasks" className="text-xs font-semibold text-slate-500 px-2 py-1.5 mb-1 mt-2">
          {tasks.slice(0, 5).map((task) => (
            <Command.Item
              key={task.id}
              onSelect={() => runCommand(() => router.push(`/goals/${task.goalId}`))} // Ideally jump to task, for now jump to goal
              className="flex items-center gap-2 px-2 py-2 text-sm text-slate-700 rounded-md cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100"
            >
              ✅ {task.title}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
      
      <div className="border-t border-slate-100 py-2 px-3 flex justify-between items-center text-[10px] text-slate-400">
        <div className="flex gap-2">
          <span>Move: <kbd className="bg-slate-100 px-1 rounded">↑</kbd> <kbd className="bg-slate-100 px-1 rounded">↓</kbd></span>
          <span>Select: <kbd className="bg-slate-100 px-1 rounded">Enter</kbd></span>
        </div>
        <span>Open: <kbd className="bg-slate-100 px-1 rounded">⌘ K</kbd></span>
      </div>
    </Command.Dialog>
  );
}
