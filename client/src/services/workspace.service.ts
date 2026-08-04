import axios from "../api/axios";
import type { Workspace,WorkspaceDetail } from "../types";

export const getMyWorkspaces=async():Promise<Workspace[]>=>{
    const res=await axios.get("/workspaces");
    return res.data.data;
};

export const getWorkspaceBySlug=async(slug:string):Promise<WorkspaceDetail>=>{
    console.log(slug)
    const res=await axios.get(`/workspaces/${slug}`);
    return res.data.data;
}

export const createWorkspace=async(data:{name:string,slug:string}):Promise<WorkspaceDetail>=>{
    const res=await axios.post("/workspaces",data);
    return res.data.data;
};
