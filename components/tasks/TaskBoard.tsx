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
import { createTask, listTasksByGoal, moveTask, updateTask } from "@/services/taskService";
import { listTeamMemberships } from "@/services/teamService";
import type { Task, TaskStatus, WorkspaceType, TeamMembership } from "@/types/models";
import { TaskComments } from "@/components/tasks/TaskComments";

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
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [editAssignee, setEditAssignee] = useState(task.assigneeUserId || "");

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleSave() {
    await updateTask(task.id, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate,
      assigneeUserId: editAssignee || null,
    });
    setIsEditing(false);
    await onUpdate();
  }

  const assigneeMember = members.find((m) => m.userId === task.assigneeUserId);
  const assigneeLabel = assigneeMember ? (assigneeMember.userEmail || "Unknown") : "Unassigned";

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="space-y-2 rounded border border-blue-200 bg-white p-2">
        <input
          className="w-full rounded border border-slate-300 p-1 text-sm"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task title"
        />
        <textarea
          className="w-full rounded border border-slate-300 p-1 text-xs"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description"
          rows={3}
        />
        <input
          type="date"
          className="w-full rounded border border-slate-300 p-1 text-xs"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
        />
        {task.workspaceType === "team" && (
          <select
            className="w-full rounded border border-slate-300 p-1 text-xs"
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
        )}
        <div className="flex gap-2">
          <button
            onClick={() => void handleSave()}
            className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="space-y-2 rounded border border-slate-200 bg-white p-2"
    >
      <div className="flex justify-between items-start">
        <button
          type="button"
          className="flex-1 cursor-grab rounded p-1 text-left text-sm font-medium hover:bg-slate-50"
          {...listeners}
          {...attributes}
        >
          {task.title}
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-slate-400 hover:text-blue-600 px-1"
        >
          Edit
        </button>
      </div>
      
      {task.description ? (
        <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
      ) : null}

      <div className="flex flex-col gap-1 text-xs text-slate-500">
        <p>Due: {task.dueDate}</p>
        {task.workspaceType === "team" ? (
          <p>Assignee: {assigneeLabel}</p>
        ) : null}
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
      assigneeUserId: workspaceType === "team" ? assigneeUserId || null : null,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
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
        <p className="rounded bg-red-50 p-2 text-sm text-red-600">{errorMessage}</p>
      ) : null}
      <form onSubmit={handleCreateTask} className="grid gap-2">
        <div className="grid gap-2 md:grid-cols-4">
          <input
            className="rounded border border-slate-300 p-2"
            required
            placeholder="Task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="rounded border border-slate-300 p-2"
            type="date"
            required
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          {workspaceType === "team" ? (
            <select
              className="rounded border border-slate-300 p-2 bg-white"
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
          ) : (
            <div />
          )}
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
            Add Task
          </button>
        </div>
        <textarea
          className="rounded border border-slate-300 p-2 text-sm"
          placeholder="Description (optional)"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
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
