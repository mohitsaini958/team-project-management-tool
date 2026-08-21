import { useAuth } from "./useAuth";
import { useWorkspace } from "./useWorkspace";
import type { Role } from "../types";

export const useCurrentRole=():Role | null =>{
    const {user}=useAuth();
    const {workspace}=useWorkspace();

    if(!user || !workspace)return null;

    const membership=workspace.members.find((m)=>m.userId === user.id);
    return membership?.role??null;
};

