import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceBySlug } from "../services/workspace.service";

export const useWorkspace=()=>{
    const {slug}=useParams<{slug:string}>();
    console.log("slug ",slug)
    const query=useQuery({
        queryKey:['workspace',slug],
        queryFn:()=>getWorkspaceBySlug(slug!),
        enabled:!!slug,
    });

    return {
        workspace:query.data,
        isLoading:query.isLoading,
        error:query.error,
    };
};