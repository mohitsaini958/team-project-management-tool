export interface User{
    id:string;
    name:string;
    email:string;
    avatarUrl:string|null;
    subscriptionStatus:string;
}

export interface AuthContextType{
    user:User|null;
    loading:boolean;
    login:(token:string,user:User)=>void;
    logout:()=>void;
}