"use client";
/* This file renders a drag-and-drop Kanban board for a goal's tasks. */
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, listTasksByGoal, moveTask, updateTask } from "@/services/taskService";
import { listTeamMemberships } from "@/services/teamService";
import type { Task, TaskStatus, WorkspaceType, TeamMembership } from "@/types/models";
import { TaskComments } from "@/components/tasks/TaskComments";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

type TaskBoardProps = {
  goalId: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  userId: string;
};

const columns: Array<{ id: TaskStatus; label: string }> = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

function TaskCard({
  task,
  userId,
  members,
  onUpdate,
}: {
  task: Task;
  userId: string;
  members: TeamMembership[];
  onUpdate: () => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { taskId: task.id },
  });

  const [isEditing, setIsEditing] = useState(false);
  
  // Store original values for reset
  const [originalValues, setOriginalValues] = useState({
    title: task.title,
    description: task.description || "",
    dueDate: task.dueDate,
    assigneeUserId: task.assigneeUserId || "",
    priority: (task.priority || "medium") as "low" | "medium" | "high",
    estimatedMinutes: task.estimatedMinutes || 0,
    actualMinutes: task.actualMinutes || 0,
  });

  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [editAssignee, setEditAssignee] = useState(task.assigneeUserId || "");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">(task.priority || "medium");
  const [editEstimate, setEditEstimate] = useState(task.estimatedMinutes || 0);
  const [editActual, setEditActual] = useState(task.actualMinutes || 0);

  // Update form values when task changes
  useEffect(() => {
    setOriginalValues({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate,
      assigneeUserId: task.assigneeUserId || "",
      priority: (task.priority || "medium") as "low" | "medium" | "high",
      estimatedMinutes: task.estimatedMinutes || 0,
      actualMinutes: task.actualMinutes || 0,
    });
    if (!isEditing) {
      setEditTitle(task.title);
      setEditDescription(task.description || "");
      setEditDueDate(task.dueDate);
      setEditAssignee(task.assigneeUserId || "");
      setEditPriority(task.priority || "medium");
      setEditEstimate(task.estimatedMinutes || 0);
      setEditActual(task.actualMinutes || 0);
    }
  }, [task, isEditing]);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  function handleCancel() {
    // Reset to original values
    setEditTitle(originalValues.title);
    setEditDescription(originalValues.description);
    setEditDueDate(originalValues.dueDate);
    setEditAssignee(originalValues.assigneeUserId);
    setEditPriority(originalValues.priority);
    setEditEstimate(originalValues.estimatedMinutes);
    setEditActual(originalValues.actualMinutes);
    setIsEditing(false);
  }

  async function handleSave() {
    await updateTask(task.id, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate,
      assigneeUserId: editAssignee || null,
      priority: editPriority,
      estimatedMinutes: Number(editEstimate),
      actualMinutes: Number(editActual),
    });
    setIsEditing(false);
    await onUpdate();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await deleteTask(task.id);
    await onUpdate();
  }

  const assigneeMember = members.find((m) => m.userId === task.assigneeUserId);
  const assigneeLabel = assigneeMember ? (assigneeMember.userEmail || "Unknown") : "Unassigned";

  // Check if overdue
  const today = new Date().toLocaleDateString('en-CA');
  const isOverdue = task.dueDate < today && task.status !== "done";

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="space-y-2 rounded-lg border-2 border-blue-300 bg-white p-3 shadow-sm">
        <input
          className="w-full rounded border border-slate-300 p-2 text-sm font-medium"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
        />
        <RichTextEditor
          content={editDescription}
          onChange={setEditDescription}
          placeholder="Add a description..."
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Due Date</label>
            <input
              type="date"
              className="w-full rounded border border-slate-300 p-1.5 text-xs"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Priority</label>
            <select
              className="w-full rounded border border-slate-300 p-1.5 text-xs"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Est. Time (min)</label>
            <input
              type="number"
              className="w-full rounded border border-slate-300 p-1.5 text-xs"
              placeholder="0"
              value={editEstimate || ""}
              onChange={(e) => setEditEstimate(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Actual Time (min)</label>
            <input
              type="number"
              className="w-full rounded border border-slate-300 p-1.5 text-xs"
              placeholder="0"
              value={editActual || ""}
              onChange={(e) => setEditActual(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        {task.workspaceType === "team" && (
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Assignee</label>
            <select
              className="w-full rounded border border-slate-300 p-1.5 text-xs"
              value={editAssignee}
              onChange={(e) => setEditAssignee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userEmail || m.userId}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => void handleSave()}
            className="flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const priorityColors = {
    low: "bg-slate-100 text-slate-600 border-slate-300",
    medium: "bg-blue-100 text-blue-700 border-blue-300",
    high: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group space-y-2 rounded-lg border bg-white p-2.5 shadow-sm transition-all hover:shadow-md ${
        task.priority === "high" ? "border-l-4 border-l-red-500" : "border-slate-200"
      } ${isOverdue ? "border-red-300 bg-red-50" : ""}`}
    >
      {/* Header: Title (draggable) */}
      <button
        type="button"
        className="w-full cursor-grab text-left text-sm font-medium text-slate-800 hover:text-slate-900 active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        {task.title}
      </button>
      
      {/* Description */}
      {task.description ? (
        <div 
          className="text-xs text-slate-600 line-clamp-3 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      ) : null}

      {/* Metadata Row: Priority & Time */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${priorityColors[task.priority || "medium"]}`}>
          {task.priority || "medium"}
        </span>
        {task.estimatedMinutes ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 border border-slate-200">
            ⏱ {task.actualMinutes || 0}/{task.estimatedMinutes}m
          </span>
        ) : null}
        {isOverdue && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-300">
            Overdue
          </span>
        )}
      </div>

      {/* Details Row: Due Date & Assignee */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className={isOverdue ? "font-semibold text-red-600" : ""}>
          📅 {new Date(task.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
        {task.workspaceType === "team" && (
          <span className="text-slate-400">👤 {assigneeLabel}</span>
        )}
      </div>

      {/* Actions: Edit & Delete buttons */}
      <div className="flex gap-1 pt-1 border-t border-slate-100">
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => void handleDelete()}
          className="flex-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>

      <TaskComments
        taskId={task.id}
        goalId={task.goalId}
        workspaceType={task.workspaceType}
        workspaceId={task.workspaceId}
        authorUserId={userId}
      />
    </article>
  );
}

function BoardColumn({
  columnId,
  label,
  tasks,
  userId,
  members,
  onUpdate,
}: {
  columnId: TaskStatus;
  label: string;
  tasks: Task[];
  userId: string;
  members: TeamMembership[];
  onUpdate: () => Promise<void>;
}) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className="min-h-[240px] rounded-lg bg-slate-100 p-3">
      <h3 className="mb-3 text-sm font-semibold">{label}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            userId={userId} 
            members={members}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}

export function TaskBoard({
  goalId,
  workspaceType,
  workspaceId,
  userId,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [members, setMembers] = useState<TeamMembership[]>([]);

  const refresh = useCallback(async () => {
    try {
      setErrorMessage("");
      const next = await listTasksByGoal(goalId, workspaceType, workspaceId);
      setTasks(next);
      
      if (workspaceType === "team") {
        const teamMembers = await listTeamMemberships(workspaceId);
        setMembers(teamMembers);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load tasks right now.";
      setErrorMessage(message);
      setTasks([]);
    }
  }, [goalId, workspaceId, workspaceType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setEstimatedMinutes("");
    setAssigneeUserId("");
    await refresh();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const targetStatus = event.over?.id as TaskStatus | undefined;
    if (!targetStatus || !columns.some((column) => column.id === targetStatus)) {
      return;
    }
    await moveTask(taskId, targetStatus);
    await refresh();
  }

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Tasks</h2>
      {errorMessage ? (
        <p className="rounded bg-red-50 p-2 text-sm text-red-600 border border-red-200">{errorMessage}</p>
      ) : null}
      
      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded border border-slate-300 p-2 text-sm"
            required
            placeholder="Task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="rounded border border-slate-300 p-2 text-sm"
            type="date"
            required
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <select
            className="rounded border border-slate-300 p-2 text-sm bg-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            className="rounded border border-slate-300 p-2 text-sm"
            placeholder="Estimated minutes (optional)"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
          />
          {workspaceType === "team" ? (
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
          ) : null}
        </div>
        <div className="mt-2">
          <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
          <RichTextEditor
            content={description}
            onChange={setDescription}
            placeholder="Add details, checklists, or type '/' for commands..."
          />
        </div>
        <button 
          type="submit"
          className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Add Task
        </button>
      </form>

      <DndContext onDragEnd={(event) => void handleDragEnd(event)}>
        <div className="grid gap-3 md:grid-cols-3">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              columnId={column.id}
              label={column.label}
              tasks={tasks.filter((task) => task.status === column.id)}
              userId={userId}
              members={members}
              onUpdate={refresh}
            />
          ))}
        </div>
      </DndContext>
    </section>
  );
}
