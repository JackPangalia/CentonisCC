import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Workspace, WorkspaceMember } from "@/types/models";

const WORKSPACE_INVITES_COLLECTION = "workspaceInvites";

type WorkspaceInvite = {
  workspaceId: string;
  createdByUserId: string;
  createdAt: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createWorkspace(
  name: string,
  userId: string,
  userEmail: string
): Promise<Workspace> {
  const timestamp = nowIso();
  const inviteCode = generateInviteCode();

  const payload: Omit<Workspace, "id"> = {
    name,
    createdByUserId: userId,
    inviteCode,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const docRef = await addDoc(collection(db, "workspaces"), payload);
  const workspace: Workspace = { id: docRef.id, ...payload };

  const memberDocId = `${docRef.id}_${userId}`;
  const member: WorkspaceMember = {
    id: memberDocId,
    workspaceId: docRef.id,
    userId,
    userEmail,
    joinedAt: timestamp,
  };
  await setDoc(doc(db, "workspaceMembers", memberDocId), member);

  await updateDoc(doc(db, "users", userId), { workspaceId: docRef.id });
  const invite: WorkspaceInvite = {
    workspaceId: docRef.id,
    createdByUserId: userId,
    createdAt: timestamp,
  };
  await setDoc(doc(db, WORKSPACE_INVITES_COLLECTION, inviteCode), invite);

  return workspace;
}

export async function joinWorkspaceByInviteCode(
  inviteCode: string,
  userId: string,
  userEmail: string
): Promise<Workspace> {
  const normalizedCode = inviteCode.trim().toUpperCase();
  const inviteSnapshot = await getDoc(
    doc(db, WORKSPACE_INVITES_COLLECTION, normalizedCode)
  );

  if (!inviteSnapshot.exists()) {
    throw new Error("Invalid invite code");
  }

  const invite = inviteSnapshot.data() as WorkspaceInvite;
  const workspaceId = invite.workspaceId;

  const memberDocId = `${workspaceId}_${userId}`;
  const existingMember = await getDoc(doc(db, "workspaceMembers", memberDocId));

  if (!existingMember.exists()) {
    const member: WorkspaceMember = {
      id: memberDocId,
      workspaceId,
      userId,
      userEmail,
      joinedAt: nowIso(),
    };
    await setDoc(doc(db, "workspaceMembers", memberDocId), member);
  }

  await updateDoc(doc(db, "users", userId), { workspaceId });

  const workspaceSnapshot = await getDoc(doc(db, "workspaces", workspaceId));
  if (!workspaceSnapshot.exists()) {
    throw new Error("Workspace not found");
  }
  const workspace = {
    id: workspaceSnapshot.id,
    ...workspaceSnapshot.data(),
  } as Workspace;

  return workspace;
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const snapshot = await getDoc(doc(db, "workspaces", workspaceId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Workspace;
}

export async function updateWorkspaceName(workspaceId: string, name: string) {
  await updateDoc(doc(db, "workspaces", workspaceId), {
    name,
    updatedAt: nowIso(),
  });
}

export async function updatePageBanner(
  workspaceId: string,
  pageKey: string,
  url: string | null
) {
  const docRef = doc(db, "workspaces", workspaceId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return;

  const data = snapshot.data();
  const pageBanners = { ...(data.pageBanners || {}), [pageKey]: url || null };
  if (!url) delete pageBanners[pageKey];

  await updateDoc(docRef, {
    pageBanners,
    updatedAt: nowIso(),
  });
}

export async function listWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "workspaceMembers"),
      where("workspaceId", "==", workspaceId)
    )
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as WorkspaceMember
  );
}

export async function leaveWorkspace(workspaceId: string, userId: string) {
  const memberDocId = `${workspaceId}_${userId}`;
  await deleteDoc(doc(db, "workspaceMembers", memberDocId));
  await updateDoc(doc(db, "users", userId), { workspaceId: null });
}

export async function regenerateInviteCode(workspaceId: string): Promise<string> {
  const workspaceSnapshot = await getDoc(doc(db, "workspaces", workspaceId));
  if (!workspaceSnapshot.exists()) {
    throw new Error("Workspace not found");
  }
  const oldCode = (workspaceSnapshot.data() as Workspace).inviteCode;
  const newCode = generateInviteCode();
  const invite: WorkspaceInvite = {
    workspaceId,
    createdByUserId: (workspaceSnapshot.data() as Workspace).createdByUserId,
    createdAt: nowIso(),
  };
  if (oldCode) {
    const oldInviteRef = doc(db, WORKSPACE_INVITES_COLLECTION, oldCode);
    const oldInviteSnapshot = await getDoc(oldInviteRef);
    if (oldInviteSnapshot.exists()) {
      await deleteDoc(oldInviteRef);
    }
  }
  await setDoc(doc(db, WORKSPACE_INVITES_COLLECTION, newCode), invite);
  await updateDoc(doc(db, "workspaces", workspaceId), {
    inviteCode: newCode,
    updatedAt: nowIso(),
  });
  return newCode;
}
