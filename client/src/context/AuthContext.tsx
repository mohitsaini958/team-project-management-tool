import { createContext,useEffect,useState,ReactNode, Children } from "react";

import axios from "../api/axios";
import type { User,AuthContextType } from "../types/auth";

export const AuthContext=createContext<AuthContextType | null>(null);

interface Props{
    children:ReactNode;
}

export const AuthProvider=({children}:Props)=>{
    const [user,setUser]=useState<User | null>(null);
    const [loading,setLoading]=useState(true);

    const login=(token:string, user:User)=>{
        localStorage.setItem("token",token);

        setUser(user);
    };

    const logout=()=>{
        localStorage.removeItem("token");

        setUser(null);
    }

    useEffect(()=>{
        const rehydrate=async ()=>{
            try {
                const token=localStorage.getItem("token");

                if(!token){
                    setLoading(false);
                    return;
                }

                const {data}=await axios.get("/auth/me");
                setUser(data.data);
            } catch{
                logout();
            } finally{
                setLoading(false);
            }
        };
        rehydrate();
    },[]);

    return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

