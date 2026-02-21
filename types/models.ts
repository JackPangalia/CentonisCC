/* This file defines shared TypeScript models used across the app. */
export type WorkspaceType = "personal" | "team";
export type TeamRole = "owner" | "member";
export type GoalStatus = "Active" | "Completed";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface AppUser {
  id: string;
  email: string;
  emailLower: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  userEmail?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  title: string;
  description: string;
  dueDate: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  goalId: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  assigneeUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  goalId: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  authorUserId: string;
  text: string;
  createdAt: string;
}

export interface WorkspaceSummary {
  activeGoals: number;
  completedGoals: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
}
