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

export interface Comment {
  id: string;
  content: string;
  issueId: string;
  authorId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export type ActivityAction =
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED'
  | 'MEMBER_INVITED'
  | 'MEMBER_REMOVED'
  | 'ISSUE_CREATED'
  | 'ISSUE_UPDATED'
  | 'ISSUE_DELETED'
  | 'ISSUE_ASSIGNED'
  | 'ISSUE_STATUS_CHANGED'
  | 'ISSUE_PRIORITY_CHANGED'
  | 'COMMENT_ADDED';

export interface ActivityLogEntry {
  id: string;
  action: ActivityAction;
  message: string;
  userId: string;
  issueId: string | null;
  projectId: string | null;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface IssueDetail extends Issue {
  comments: Comment[];
  activityLogs: ActivityLogEntry[];
}