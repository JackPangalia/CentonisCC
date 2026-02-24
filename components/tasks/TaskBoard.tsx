"use client";
/* This file renders a drag-and-drop Kanban board for a goal's tasks. */
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useState, useRef } from "react";
import { createTask, deleteTask, listTasksByGoal, moveTask, updateTask, getSubtasks, isTaskBlocked } from "@/services/taskService";
import { listTeamMemberships } from "@/services/teamService";
import type { Task, TaskStatus, WorkspaceType, TeamMembership } from "@/types/models";
import { TaskComments } from "@/components/tasks/TaskComments";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

type TaskBoardProps = {
  tasks: Task[];
  members: TeamMembership[];
  onUpdate: () => Promise<void>;
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
  allTasks,
  onUpdate,
}: {
  task: Task;
  userId: string;
  members: TeamMembership[];
  allTasks: Task[];
  onUpdate: () => Promise<void>;
}) {
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { taskId: task.id },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  
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

  async function handleTitleSave() {
    if (editTitle.trim() === task.title) {
      setIsTitleEditing(false);
      return;
    }
    await updateTask(task.id, { title: editTitle });
    setIsTitleEditing(false);
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

  // Get subtasks
  const subtasks = getSubtasks(allTasks, task.id);
  const completedSubtasks = subtasks.filter((st) => st.status === "done").length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  // Check if blocked
  const blocked = isTaskBlocked(task, allTasks);
  const blockingTasks = task.blockedByTaskIds
    ? allTasks.filter((t) => task.blockedByTaskIds!.includes(t.id))
    : [];

  // Check if this is a subtask
  const isSubtask = task.parentTaskId && task.parentTaskId !== null;

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
    <div className={`${isSubtask ? "ml-4 border-l-2 border-l-blue-300 pl-2" : ""}`}>
      <article
        ref={setNodeRef}
        style={style}
        className={`group space-y-2 rounded-lg border bg-white p-2.5 shadow-sm transition-all hover:shadow-md ${
          task.priority === "high" ? "border-l-4 border-l-red-500" : "border-slate-200"
        } ${isOverdue ? "border-red-300 bg-red-50" : ""} ${blocked ? "opacity-60" : ""}`}
      >
      {/* Header: Title (draggable & inline editable) */}
      {isTitleEditing ? (
        <input
          autoFocus
          className="w-full rounded border-blue-500 border p-1 text-sm font-medium text-slate-800 outline-none"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTitleSave();
            if (e.key === "Escape") {
              setEditTitle(task.title);
              setIsTitleEditing(false);
            }
          }}
        />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 flex items-start gap-2">
            {subtasks.length > 0 && (
              <button
                type="button"
                onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                className="text-slate-400 hover:text-blue-600 mt-0.5"
                title={isSubtasksExpanded ? "Collapse subtasks" : "Expand subtasks"}
              >
                {isSubtasksExpanded ? "▼" : "▶"}
              </button>
            )}
            {isSubtask && (
              <span className="text-xs text-slate-400 mt-1" title="Subtask">└</span>
            )}
            <button
              type="button"
              className="flex-1 cursor-grab text-left text-sm font-medium text-slate-800 hover:text-blue-600 active:cursor-grabbing"
              onClick={(e) => {
                // Only edit if not dragging
                if (e.detail === 1) {
                  setIsTitleEditing(true);
                }
              }}
              {...listeners}
              {...attributes}
            >
              {task.title}
            </button>
          </div>
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-blue-600 p-1 rounded"
              title="Edit details"
            >
              ✏️
            </button>
            <button
              onClick={() => void handleDelete()}
              className="text-slate-400 hover:text-red-600 p-1 rounded"
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
      
      {/* Description */}
      {task.description ? (
        <div 
          className="text-xs text-slate-600 line-clamp-3 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      ) : null}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Blocked Indicator */}
      {blocked && blockingTasks.length > 0 && (
        <div className="rounded bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-800">
          <span className="font-semibold">⚠️ Blocked by:</span>{" "}
          {blockingTasks.map((bt) => bt.title).join(", ")}
        </div>
      )}

      {/* Subtask Progress */}
      {subtasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              📋 {completedSubtasks}/{subtasks.length} subtasks
            </span>
            <span className="font-medium">{subtaskProgress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

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

      {/* Actions: Edit & Delete buttons (Removed - moved to hover) */}
      
      <div className="pt-2">
        <TaskComments
          taskId={task.id}
          goalId={task.goalId}
          workspaceType={task.workspaceType}
          workspaceId={task.workspaceId}
          authorUserId={userId}
        />
      </div>
      </article>

      {/* Render Subtasks */}
      {subtasks.length > 0 && isSubtasksExpanded && (
        <div className="mt-2 space-y-2">
          {subtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              userId={userId}
              members={members}
              allTasks={allTasks}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BoardColumn({
  columnId,
  label,
  tasks,
  allTasks,
  userId,
  members,
  onUpdate,
}: {
  columnId: TaskStatus;
  label: string;
  tasks: Task[];
  allTasks: Task[];
  userId: string;
  members: TeamMembership[];
  onUpdate: () => Promise<void>;
}) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className="min-h-[240px] rounded-lg bg-slate-100 p-3">
      <h3 className="mb-3 text-sm font-semibold">{label}</h3>
      <div className="space-y-2">
        {tasks
          .filter((task) => !task.parentTaskId || task.parentTaskId === null)
          .map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              userId={userId} 
              members={members}
              allTasks={allTasks}
              onUpdate={onUpdate}
            />
          ))}
      </div>
    </div>
  );
}

export function TaskBoard({
  tasks,
  members,
  onUpdate,
  goalId,
  workspaceType,
  workspaceId,
  userId,
}: TaskBoardProps) {
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const targetStatus = event.over?.id as TaskStatus | undefined;
    if (!targetStatus || !columns.some((column) => column.id === targetStatus)) {
      return;
    }
    await moveTask(taskId, targetStatus);
    await onUpdate();
  }

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Tasks</h2>
      {errorMessage ? (
        <p className="rounded bg-red-50 p-2 text-sm text-red-600 border border-red-200">{errorMessage}</p>
      ) : null}
      
      <DndContext onDragEnd={(event) => void handleDragEnd(event)}>
        <div className="grid gap-3 md:grid-cols-3">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              columnId={column.id}
              label={column.label}
              tasks={tasks.filter((task) => task.status === column.id)}
              allTasks={tasks}
              userId={userId}
              members={members}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </DndContext>
    </section>
  );
}
