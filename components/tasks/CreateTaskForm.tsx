"use client";

import { useState, useRef, useEffect } from "react";
import { createTask } from "@/services/taskService";
import type { WorkspaceType, TeamMembership, Task } from "@/types/models";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

type CreateTaskFormProps = {
  goalId: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  members: TeamMembership[];
  existingTasks: Task[];
  onTaskCreated: () => Promise<void>;
};

export function CreateTaskForm({
  goalId,
  workspaceType,
  workspaceId,
  members,
  existingTasks,
  onTaskCreated,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [tags, setTags] = useState("");
  const [parentTaskId, setParentTaskId] = useState("");
  const [blockedByTaskIds, setBlockedByTaskIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Filter out tasks that are already subtasks (to avoid circular dependencies)
  const availableParentTasks = existingTasks.filter(
    (task) => !task.parentTaskId || task.parentTaskId === null
  );
  
  // Filter out the current task being created and its potential subtasks
  const availableDependencyTasks = existingTasks;

  // Keyboard shortcut 'n' to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
          setIsExpanded(false);
        }
        return;
      }

      if (e.key === "n") {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => titleInputRef.current?.focus(), 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      // Parse tags from comma-separated string
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await createTask({
        goalId,
        workspaceType,
        workspaceId,
        title,
        description,
        dueDate,
        priority,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : 0,
        assigneeUserId: workspaceType === "team" ? assigneeUserId || null : null,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        parentTaskId: parentTaskId || null,
        blockedByTaskIds: blockedByTaskIds.length > 0 ? blockedByTaskIds : undefined,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
      setEstimatedMinutes("");
      setAssigneeUserId("");
      setTags("");
      setParentTaskId("");
      setBlockedByTaskIds([]);
      setIsExpanded(false);
      await onTaskCreated();
    } catch (error) {
       setErrorMessage("Failed to create task.");
    }
  }

  function toggleDependency(taskId: string) {
    setBlockedByTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
      >
        <span>➕</span> Add New Task <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">N</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-lg relative animate-in fade-in slide-in-from-top-2">
      {errorMessage && (
        <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{errorMessage}</p>
      )}
      
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-semibold text-slate-700">New Task</h3>
        <button 
          type="button" 
          onClick={() => setIsExpanded(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full sm:col-span-2">
           <input
            ref={titleInputRef}
            className="w-full rounded border border-slate-300 p-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            required
            placeholder="What needs to be done?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </div>
        <div className="col-span-full sm:col-span-1">
          <input
            className="w-full rounded border border-slate-300 p-2 text-sm"
            type="date"
            required
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <select
          className="rounded border border-slate-300 p-2 text-sm bg-white"
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        
        <input
          type="number"
          className="rounded border border-slate-300 p-2 text-sm"
          placeholder="Est. Minutes"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(e.target.value)}
        />
        
        {workspaceType === "team" && (
          <select
            className="rounded border border-slate-300 p-2 text-sm bg-white"
            value={assigneeUserId}
            onChange={(event) => setAssigneeUserId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.userEmail || m.userId}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Description</label>
        <RichTextEditor
          content={description}
          onChange={setDescription}
          placeholder="Add details, checklists, or type '/' for commands..."
        />
      </div>

      {/* Tags Input */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Tags</label>
        <input
          type="text"
          className="w-full rounded border border-slate-300 p-2 text-sm"
          placeholder="Enter tags separated by commas (e.g., frontend, urgent, bug)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-400">Separate multiple tags with commas</p>
      </div>

      {/* Parent Task Selector */}
      {availableParentTasks.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Parent Task (Optional)</label>
          <select
            className="w-full rounded border border-slate-300 p-2 text-sm bg-white"
            value={parentTaskId}
            onChange={(e) => setParentTaskId(e.target.value)}
          >
            <option value="">None (Top-level task)</option>
            {availableParentTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dependencies Selector */}
      {availableDependencyTasks.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Blocked By (Dependencies)</label>
          <div className="max-h-32 overflow-y-auto rounded border border-slate-300 bg-white p-2 space-y-1">
            {availableDependencyTasks.map((task) => (
              <label
                key={task.id}
                className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={blockedByTaskIds.includes(task.id)}
                  onChange={() => toggleDependency(task.id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{task.title}</span>
              </label>
            ))}
          </div>
          {blockedByTaskIds.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              This task will be blocked until {blockedByTaskIds.length} task(s) are completed
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button 
          type="button"
          onClick={() => setIsExpanded(false)}
          className="rounded px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="rounded bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 shadow-sm"
        >
          Create Task
        </button>
      </div>
    </form>
  );
}
