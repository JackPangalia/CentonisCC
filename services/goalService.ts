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
  writeBatch,
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

export async function deleteGoal(goalId: string, workspaceType: WorkspaceType, workspaceId: string) {
  // 1. Delete all tasks associated with this goal first
  // We do this first so that task deletion rules (which might check goal existence) pass
  // We must filter by workspace info to satisfy security rules for reading tasks
  const tasksSnapshot = await getDocs(
    query(
      collection(db, "tasks"), 
      where("goalId", "==", goalId),
      where("workspaceType", "==", workspaceType),
      where("workspaceId", "==", workspaceId)
    )
  );
  
  const batch = writeBatch(db);
  tasksSnapshot.docs.forEach((taskDoc) => {
    batch.delete(taskDoc.ref);
  });
  
  await batch.commit();

  // 2. Delete the goal
  await deleteDoc(doc(db, "goals", goalId));
}

export async function getGoalById(goalId: string): Promise<Goal | null> {
  const snapshot = await getDoc(doc(db, "goals", goalId));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Goal, "id">) };
}
