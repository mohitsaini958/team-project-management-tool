import axios from '../api/axios';
import type { Project } from '../types';

export const createProject = async (
  workspaceId: string,
  data: { name: string; description?: string }
): Promise<Project> => {
  // Backend route is POST /projects with no :workspaceId in the URL —
  // it expects workspaceId as part of the request body instead.
  const res = await axios.post('/projects', { ...data, workspaceId });
  return res.data.data;
};

export const getProjectsByWorkspace = async (workspaceId: string): Promise<Project[]> => {
  const res = await axios.get(`/projects/workspace/${workspaceId}`);
  return res.data.data;
};

export const updateProject = async (
  projectId: string,
  data: { name?: string; description?: string }
): Promise<Project> => {
  const res = await axios.patch(`/projects/${projectId}`, data);
  return res.data.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await axios.delete(`/projects/${projectId}`);
};