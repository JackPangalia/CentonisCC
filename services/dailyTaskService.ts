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
import type { DailyTask, EntryStatus } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createDailyTask(
  workspaceId: string,
  userId: string,
  data: { title: string; date: string }
): Promise<string> {
  const timestamp = nowIso();
  const payload: Omit<DailyTask, "id"> = {
    workspaceId,
    createdByUserId: userId,
    title: data.title,
    description: "",
    status: "not_started",
    date: data.date,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, "dailyTasks"), payload);
  return docRef.id;
}

export async function getDailyTask(taskId: string): Promise<DailyTask | null> {
  const snapshot = await getDoc(doc(db, "dailyTasks", taskId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as DailyTask;
}

export async function listDailyTasks(
  workspaceId: string,
  date?: string
): Promise<DailyTask[]> {
  const constraints = [where("workspaceId", "==", workspaceId)];
  if (date) {
    constraints.push(where("date", "==", date));
  }
  const snapshot = await getDocs(
    query(collection(db, "dailyTasks"), ...constraints)
  );
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as DailyTask)
    .filter((t) => !t.archived);
}

export async function updateDailyTask(
  taskId: string,
  data: Partial<Pick<DailyTask, "title" | "description" | "status" | "date" | "coverImage" | "icon">>
) {
  await updateDoc(doc(db, "dailyTasks", taskId), {
    ...data,
    updatedAt: nowIso(),
  });
}

export async function updateDailyTaskStatus(taskId: string, status: EntryStatus) {
  await updateDoc(doc(db, "dailyTasks", taskId), {
    status,
    updatedAt: nowIso(),
  });
}

export async function updateDailyTaskOwner(taskId: string, newUserId: string) {
  await updateDoc(doc(db, "dailyTasks", taskId), {
    createdByUserId: newUserId,
    updatedAt: nowIso(),
  });
}

export async function archiveDailyTask(taskId: string) {
  await updateDoc(doc(db, "dailyTasks", taskId), {
    archived: true,
    updatedAt: nowIso(),
  });
}

export async function deleteDailyTask(taskId: string) {
  await deleteDoc(doc(db, "dailyTasks", taskId));
}

export async function listDailyTasksForEffort(
  workspaceId: string,
  startDate: string,
  endDate: string
): Promise<DailyTask[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "dailyTasks"),
      where("workspaceId", "==", workspaceId)
    )
  );
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as DailyTask)
    .filter((t) => t.date >= startDate && t.date <= endDate);
}
