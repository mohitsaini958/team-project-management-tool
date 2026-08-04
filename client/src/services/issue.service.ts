import axios from '../api/axios';
import type { Issue } from '../types';

export const getProjectIssues = async (projectId: string): Promise<Issue[]> => {
  const res = await axios.get(`/issues/project/${projectId}`);
  return res.data.data;
};

export const createIssue = async (
  projectId: string,
  data: { title: string; description?: string; priority?: string; status?: string }
): Promise<Issue> => {
  // Backend expects projectId in the body, not the URL — matches how
  // project creation works too.
  const res = await axios.post('/issues', { ...data, projectId });
  return res.data.data;
};

export const updateIssue = async (
  issueId: string,
  // Only these four fields are accepted by updateIssueSchema on the backend —
  // no assigneeId, no dueDate (Issue model doesn't have a dueDate column).
  data: Partial<Pick<Issue, 'title' | 'description' | 'status' | 'priority'>>
): Promise<Issue> => {
  const res = await axios.patch(`/issues/${issueId}`, data);
  return res.data.data;
};

export const deleteIssue = async (issueId: string): Promise<void> => {
  await axios.delete(`/issues/${issueId}`);
};