"use client";
/* This file renders a drag-and-drop Kanban board for a goal's tasks. */
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { deleteTask, moveTask, updateTask, getSubtasks, isTaskBlocked } from "@/services/taskService";
import type { Task, TaskStatus, WorkspaceType, TeamMembership } from "@/types/models";
import { TaskComments } from "@/components/tasks/TaskComments";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Edit2, Trash2, Clock, User, CheckCircle2, AlertCircle, ArrowRight, CornerDownRight, Calendar } from "lucide-react";

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
      <div ref={setNodeRef} style={style} className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-sm">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-sm font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
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
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Due Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-xs text-zinc-100 focus:outline-none"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Priority</label>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-xs text-zinc-100 focus:outline-none"
              value={editPriority}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Est. Time (min)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              placeholder="0"
              value={editEstimate || ""}
              onChange={(e) => setEditEstimate(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Actual Time (min)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              placeholder="0"
              value={editActual || ""}
              onChange={(e) => setEditActual(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        {task.workspaceType === "team" && (
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Assignee</label>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-xs text-zinc-100 focus:outline-none"
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
            className="flex-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800/50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const priorityColors = {
    low: "bg-zinc-800/50 text-zinc-400 border-zinc-700/50",
    medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    high: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className={`${isSubtask ? "ml-4 border-l border-l-zinc-300 dark:border-l-zinc-700 pl-2" : ""}`}>
      <article
        ref={setNodeRef}
        style={style}
        className={`group space-y-3 rounded-xl border bg-white/70 dark:bg-zinc-900/60 p-4 shadow-sm backdrop-blur-md transition-all hover:bg-white/90 dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:shadow-md ${
          task.priority === "high" ? "border-l-4 border-l-red-500/50" : "border-zinc-200 dark:border-zinc-800/80"
        } ${isOverdue ? "border-red-400/50 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/5" : ""} ${blocked ? "opacity-50 grayscale-[0.5]" : ""}`}
      >
      {/* Header: Title (draggable & inline editable) */}
      {isTitleEditing ? (
        <input
          autoFocus
          className="w-full rounded-lg border-zinc-200 dark:border-zinc-700 border bg-white dark:bg-zinc-800 p-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 mt-0.5 transition-colors"
                title={isSubtasksExpanded ? "Collapse subtasks" : "Expand subtasks"}
              >
                {isSubtasksExpanded ? <CornerDownRight className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            )}
            {isSubtask && (
              <CornerDownRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 mt-1" />
            )}
            <button
              type="button"
              className="flex-1 cursor-grab text-left text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-100 active:cursor-grabbing transition-colors line-clamp-2 leading-tight"
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
              className="text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg transition-colors flex items-center justify-center"
              title="Edit details"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={() => void handleDelete()}
              className="text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg transition-colors flex items-center justify-center"
              title="Delete task"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Description */}
      {task.description ? (
        <div 
          className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 prose prose-invert prose-sm max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      ) : null}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-md bg-zinc-100 dark:bg-zinc-800/50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Blocked Indicator */}
      {blocked && blockingTasks.length > 0 && (
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 px-2 py-1.5 text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" />
          <span className="font-semibold">Blocked by:</span>{" "}
          <span className="truncate max-w-[150px]">{blockingTasks.map((bt) => bt.title).join(", ")}</span>
        </div>
      )}

      {/* Subtask Progress */}
      {subtasks.length > 0 && (
        <div className="space-y-1.5 mt-2">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {completedSubtasks}/{subtasks.length}
            </span>
            <span>{subtaskProgress}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-zinc-400 dark:bg-zinc-600 transition-all rounded-full"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/50 mt-1">
        {/* Metadata Row: Priority & Time */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority || "medium"]}`}>
            {task.priority || "medium"}
          </span>
          {task.estimatedMinutes ? (
            <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
              <Clock className="h-3 w-3" /> {task.actualMinutes || 0}/{task.estimatedMinutes}m
            </span>
          ) : null}
        </div>

        {/* Details Row: Due Date & Assignee */}
        <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-500">
          <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-bold" : ""}`}>
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
          {task.workspaceType === "team" && (
            <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400" title={assigneeLabel}>
              <User className="h-3 w-3" /> 
            </span>
          )}
        </div>
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
    <div ref={setNodeRef} className="min-h-[240px] rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/60 dark:border-zinc-800/60 p-3 flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          columnId === 'todo' ? 'bg-zinc-400' : 
          columnId === 'in_progress' ? 'bg-blue-400' : 
          'bg-emerald-400'
        }`} />
        {label}
        <span className="ml-auto bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {tasks.length}
        </span>
      </h3>
      <div className="space-y-3 flex-1">
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
          {tasks.length === 0 && (
            <div className="h-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 text-xs italic">
              Empty
            </div>
          )}
      </div>
    </div>
  );
}

export function TaskBoard({
  tasks,
  members,
  onUpdate,
  userId,
}: TaskBoardProps) {
  const errorMessage = "";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span className="text-xl">📋</span> Board
        </h2>
      </div>
      {errorMessage ? (
        <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">{errorMessage}</p>
      ) : null}
      
      <DndContext onDragEnd={(event) => void handleDragEnd(event)}>
        <div className="grid gap-4 md:grid-cols-3">
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
    </div>
  );
}