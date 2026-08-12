import axios from '../api/axios';
import type { Issue, IssueDetail, IssueStatus, Comment } from '../types';

export const getProjectIssues = async (projectId: string): Promise<Issue[]> => {
  const res = await axios.get(`/issues/project/${projectId}`);
  return res.data.data;
};

// Full detail — includes comments and activityLogs, unlike the list endpoint above
export const getIssueById = async (issueId: string): Promise<IssueDetail> => {
  const res = await axios.get(`/issues/${issueId}`);
  return res.data.data;
};

export const createIssue = async (
  projectId: string,
  data: { title: string; description?: string; priority?: string; status?: string; assigneeId?: string }
): Promise<Issue> => {
  const res = await axios.post('/issues', { ...data, projectId });
  return res.data.data;
};

export const updateIssue = async (
  issueId: string,
  // order is intentionally excluded — it has its own dedicated
  // batch endpoint (reorderIssues below), not part of updateIssueSchema
  data: Partial<Pick<Issue, 'title' | 'description' | 'status' | 'priority'>>
): Promise<Issue> => {
  const res = await axios.patch(`/issues/${issueId}`, data);
  return res.data.data;
};

export const deleteIssue = async (issueId: string): Promise<void> => {
  await axios.delete(`/issues/${issueId}`);
};

// Real batch endpoint — PATCH /issues/reorder, wrapped in a Prisma
// transaction on the backend. One request for the whole drag operation.
export const reorderIssues = async (
  updates: { id: string; status: IssueStatus; order: number }[]
): Promise<void> => {
  await axios.patch('/issues/reorder', { issues: updates });
};

export const createComment = async (
  issueId: string,
  content: string
): Promise<Comment> => {
  const res = await axios.post(`/comments/${issueId}`, { content });
  return res.data.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await axios.delete(`/comments/${commentId}`);
};