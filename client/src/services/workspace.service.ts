import axios from "../api/axios";
import type { Workspace, WorkspaceDetail, WorkspaceMember, Role } from "../types";

export const getMyWorkspaces = async (): Promise<Workspace[]> => {
    const res = await axios.get("/workspaces");
    return res.data.data;
};

export const getWorkspaceBySlug = async (slug: string): Promise<WorkspaceDetail> => {
    const res = await axios.get(`/workspaces/${slug}`);
    return res.data.data;
}

export const createWorkspace = async (data: { name: string; slug: string }): Promise<WorkspaceDetail> => {
    const res = await axios.post("/workspaces", data);
    return res.data.data;
};

export const inviteMember = async (
    workspaceId: string,
    data: { email: string; role: Role }
): Promise<WorkspaceMember> => {
    const res = await axios.post(`/workspaces/${workspaceId}/members`, data);
    return res.data.data;
};

export const removeMember = async (
    workspaceId: string,
    userId: string
): Promise<void> => {
    await axios.delete(`/workspaces/${workspaceId}/members/${userId}`);
};