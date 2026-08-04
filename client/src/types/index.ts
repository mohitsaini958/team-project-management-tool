import type { User } from './auth';

export type Role = 'OWNER' | 'MEMBER' | 'VIEWER';
export type IssueStatus = 'BACKLOG' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: { projects: number; members: number };
}

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface WorkspaceDetail extends Workspace {
  members: WorkspaceMember[];
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  _count?: { issues: number };
}

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  order: number;
  projectId: string;
  reporterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  reporter?: User;
}