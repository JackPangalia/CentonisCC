/* This file handles goal CRUD operations in Firestore. */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Goal, GoalStatus, WorkspaceType } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createGoal(input: {
  workspaceType: WorkspaceType;
  workspaceId: string;
  title: string;
  description: string;
  dueDate: string;
}) {
  const timestamp = nowIso();
  const payload: Omit<Goal, "id"> = {
    workspaceType: input.workspaceType,
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
    status: "Active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await addDoc(collection(db, "goals"), payload);
}

export async function listGoals(
  workspaceType: WorkspaceType,
  workspaceId: string,
): Promise<Goal[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "goals"),
      where("workspaceType", "==", workspaceType),
      where("workspaceId", "==", workspaceId),
    ),
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as Goal,
  );
}

export async function updateGoal(
  goalId: string,
  data: Partial<Pick<Goal, "title" | "description" | "dueDate" | "status">>,
) {
  await updateDoc(doc(db, "goals", goalId), {
    ...data,
    updatedAt: nowIso(),
  });
}

export async function setGoalStatus(goalId: string, status: GoalStatus) {
  await updateGoal(goalId, { status });
}

export async function deleteGoal(goalId: string) {
  await deleteDoc(doc(db, "goals", goalId));
}

export async function getGoalById(goalId: string): Promise<Goal | null> {
  const snapshot = await getDoc(doc(db, "goals", goalId));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Goal, "id">) };
}
