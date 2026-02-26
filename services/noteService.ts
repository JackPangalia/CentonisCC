/* This file handles note CRUD operations in Firestore. */
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
import type { Note, NoteFolder } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createNote(userId: string, folderId: string | null = null): Promise<string> {
  const timestamp = nowIso();
  const payload: Omit<Note, "id"> = {
    userId,
    title: "Untitled",
    content: "",
    folderId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, "notes"), payload);
  return docRef.id;
}

export async function listNotes(userId: string): Promise<Note[]> {
  const snapshot = await getDocs(
    query(collection(db, "notes"), where("userId", "==", userId))
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as Note
  );
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const snapshot = await getDoc(doc(db, "notes", noteId));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Note, "id">) };
}

export async function updateNote(
  noteId: string,
  data: Partial<Pick<Note, "title" | "content" | "folderId">>
) {
  await updateDoc(doc(db, "notes", noteId), {
    ...data,
    updatedAt: nowIso(),
  });
}

export async function deleteNote(noteId: string) {
  await deleteDoc(doc(db, "notes", noteId));
}

// Folder CRUD Operations

export async function createFolder(userId: string, name: string): Promise<string> {
  const timestamp = nowIso();
  const payload = {
    userId,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, "noteFolders"), payload);
  return docRef.id;
}

export async function listFolders(userId: string): Promise<NoteFolder[]> {
  const snapshot = await getDocs(
    query(collection(db, "noteFolders"), where("userId", "==", userId))
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() } as NoteFolder)
  );
}

export async function updateFolder(folderId: string, name: string) {
  await updateDoc(doc(db, "noteFolders", folderId), {
    name,
    updatedAt: nowIso(),
  });
}

export async function deleteFolder(folderId: string, userId: string) {
  // Fetch only this user's notes, then clear folder references locally.
  // This avoids permission failures from touching notes not owned by requester.
  const notesSnapshot = await getDocs(
    query(collection(db, "notes"), where("userId", "==", userId))
  );

  const notesInFolder = notesSnapshot.docs.filter(
    (noteDoc) => noteDoc.data().folderId === folderId
  );

  const updatePromises = notesInFolder.map((noteDoc) =>
    updateDoc(doc(db, "notes", noteDoc.id), { folderId: null })
  );
  await Promise.all(updatePromises);

  // Delete the folder
  await deleteDoc(doc(db, "noteFolders", folderId));
}
