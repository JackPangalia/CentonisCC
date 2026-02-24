/* This file handles task CRUD operations and drag-and-drop updates. */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Task, TaskStatus, WorkspaceType, TaskFilter } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createTask(input: {
  goalId: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  title: string;
  description: string;
  dueDate: string;
  priority?: "low" | "medium" | "high";
  estimatedMinutes?: number;
  assigneeUserId?: string | null;
  tags?: string[];
  parentTaskId?: string | null;
  blockedByTaskIds?: string[];
}) {
  const timestamp = nowIso();
  const payload: Omit<Task, "id"> = {
    goalId: input.goalId,
    workspaceType: input.workspaceType,
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
    status: "todo",
    priority: input.priority || "medium",
    estimatedMinutes: input.estimatedMinutes || 0,
    actualMinutes: 0,
    dueDate: input.dueDate,
    assigneeUserId: input.assigneeUserId ?? null,
    tags: input.tags || [],
    parentTaskId: input.parentTaskId ?? null,
    blockedByTaskIds: input.blockedByTaskIds || [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await addDoc(collection(db, "tasks"), payload);
}

export async function listTasksByGoal(
  goalId: string,
  workspaceType: WorkspaceType,
  workspaceId: string,
): Promise<Task[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "tasks"),
      where("goalId", "==", goalId),
      where("workspaceType", "==", workspaceType),
      where("workspaceId", "==", workspaceId),
    ),
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as Task,
  );
}

export async function listTasksByWorkspace(
  workspaceType: WorkspaceType,
  workspaceId: string,
): Promise<Task[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "tasks"),
      where("workspaceType", "==", workspaceType),
      where("workspaceId", "==", workspaceId),
    ),
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as Task,
  );
}

export async function updateTask(taskId: string, data: Partial<Task>) {
  await updateDoc(doc(db, "tasks", taskId), {
    ...data,
    updatedAt: nowIso(),
  });
}

export async function moveTask(taskId: string, status: TaskStatus) {
  await updateTask(taskId, { status });
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, "tasks", taskId));
}

// Client-side filtering function
export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  let filtered = [...tasks];

  // Filter by status
  if (filter.status && filter.status.length > 0) {
    filtered = filtered.filter((task) => filter.status!.includes(task.status));
  }

  // Filter by priority
  if (filter.priority && filter.priority.length > 0) {
    filtered = filtered.filter(
      (task) => task.priority && filter.priority!.includes(task.priority)
    );
  }

  // Filter by assignee
  if (filter.assigneeUserId && filter.assigneeUserId.length > 0) {
    filtered = filtered.filter(
      (task) =>
        task.assigneeUserId &&
        filter.assigneeUserId!.includes(task.assigneeUserId)
    );
  }

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter(
      (task) =>
        task.tags &&
        task.tags.length > 0 &&
        filter.tags!.some((tag) => task.tags!.includes(tag))
    );
  }

  // Filter by date range
  if (filter.dateRange) {
    if (filter.dateRange.start) {
      filtered = filtered.filter(
        (task) => task.dueDate >= filter.dateRange!.start!
      );
    }
    if (filter.dateRange.end) {
      filtered = filtered.filter(
        (task) => task.dueDate <= filter.dateRange!.end!
      );
    }
  }

  // Filter by parent task
  if (filter.parentTaskId !== undefined) {
    if (filter.parentTaskId === null) {
      // Show only top-level tasks (no parent)
      filtered = filtered.filter(
        (task) => !task.parentTaskId || task.parentTaskId === null
      );
    } else {
      // Show only subtasks of this parent
      filtered = filtered.filter(
        (task) => task.parentTaskId === filter.parentTaskId
      );
    }
  }

  // Filter by blocked status
  if (filter.showBlocked !== undefined) {
    if (filter.showBlocked) {
      filtered = filtered.filter((task) => isTaskBlocked(task, tasks));
    } else {
      filtered = filtered.filter((task) => !isTaskBlocked(task, tasks));
    }
  }

  // Filter subtasks visibility
  if (filter.showSubtasks === false) {
    filtered = filtered.filter(
      (task) => !task.parentTaskId || task.parentTaskId === null
    );
  }

  // Apply text search
  if (filter.searchQuery && filter.searchQuery.trim()) {
    filtered = searchTasks(filtered, filter.searchQuery);
  }

  return filtered;
}

// Text search function
export function searchTasks(tasks: Task[], query: string): Task[] {
  const searchLower = query.toLowerCase().trim();
  if (!searchLower) return tasks;

  return tasks.filter((task) => {
    const titleMatch = task.title.toLowerCase().includes(searchLower);
    const descMatch =
      task.description && task.description.toLowerCase().includes(searchLower);
    const tagMatch =
      task.tags &&
      task.tags.some((tag) => tag.toLowerCase().includes(searchLower));
    return titleMatch || descMatch || tagMatch;
  });
}

// Get all subtasks of a parent task
export function getSubtasks(tasks: Task[], parentId: string): Task[] {
  return tasks.filter(
    (task) => task.parentTaskId === parentId || task.parentTaskId === parentId
  );
}

// Check if a task is blocked by incomplete dependencies
export function isTaskBlocked(task: Task, allTasks: Task[]): boolean {
  if (!task.blockedByTaskIds || task.blockedByTaskIds.length === 0) {
    return false;
  }

  // Check if any blocking task is not done
  return task.blockedByTaskIds.some((blockingId) => {
    const blockingTask = allTasks.find((t) => t.id === blockingId);
    return blockingTask && blockingTask.status !== "done";
  });
}
