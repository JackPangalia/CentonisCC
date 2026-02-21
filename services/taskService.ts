/* This file handles task CRUD operations and drag-and-drop updates. */
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Task, TaskStatus, WorkspaceType } from "@/types/models";

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
  assigneeUserId?: string | null;
}) {
  const timestamp = nowIso();
  const payload: Omit<Task, "id"> = {
    goalId: input.goalId,
    workspaceType: input.workspaceType,
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
    status: "todo",
    dueDate: input.dueDate,
    assigneeUserId: input.assigneeUserId ?? null,
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
