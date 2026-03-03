export type DatabaseType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "projects"
  | "random_notes";

export type EntryStatus = "not_started" | "in_progress" | "done";

export interface AppUser {
  id: string;
  email: string;
  emailLower: string;
  workspaceId?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  createdByUserId: string;
  inviteCode: string;
  /** Page cover banner URLs keyed by page (dashboard, daily, weekly, monthly, quarterly, yearly, projects, notes) */
  pageBanners?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  joinedAt: string;
}

export interface DailyTask {
  id: string;
  workspaceId: string;
  createdByUserId: string;
  title: string;
  description: string;
  status: EntryStatus;
  date: string;
  archived?: boolean;
  coverImage?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseEntry {
  id: string;
  workspaceId: string;
  createdByUserId: string;
  databaseType: Exclude<DatabaseType, "daily" | "projects" | "random_notes">;
  title: string;
  content: string;
  period: string;
  date: string;
  status: EntryStatus;
  coverImage?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  createdByUserId: string;
  name: string;
  description: string;
  status: EntryStatus;
  gitRepo: string;
  link: string;
  content: string;
  coverImage?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RandomNote {
  id: string;
  workspaceId: string;
  createdByUserId: string;
  title: string;
  content: string;
  folderId?: string | null;
  coverImage?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFolder {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
