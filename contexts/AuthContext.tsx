import { createContext, ReactNode, useContext, useState } from "react";
import { setCookie } from 'nookies';
import Router from 'next/router';

import { api } from "../services/api";

interface SignInCredentials {
    email:string;
    password:string;
}

interface User {
    email:string;
    permissions:string[];
    roles:string[];
}

interface AuthContextData {
    signIn(credentials: SignInCredentials): Promise<void>;
    user:User;
    isAuthenticated: boolean;
};

interface AuthProviderProps {
    children:ReactNode;
}
 export const AuthContext = createContext({} as AuthContextData);
 
 
 export function AuthProvider({children}: AuthProviderProps) {
    const [user,setUser] = useState<User>()
    const isAuthenticated = !!user;

    const signIn = async ({email,password}:SignInCredentials) =>{
        try {
           const response = await api.post('sessions',{
               email,
               password
           });    
   
           const { permissions ,roles, token, refreshToken  } = response.data;
           setCookie(undefined, 'nextauth.token', token, {
               maxAge: 60 * 60 *  24  * 30, // 30 days
               path:'/' // all

           });
           setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
            maxAge: 60 * 60 *  24  * 30, // 30 days
            path:'/' // all
        } );
           setUser({
               email,
               permissions,
               roles
           })
           Router.push('/dashboard');
           
        }catch (err) {
          console.log(err)  
        }
       
    }
     return (
        <AuthContext.Provider value={{ signIn,isAuthenticated,user }}> {children} </AuthContext.Provider>
     );
 }


 export const useAuth = () => {
   const context =  useContext(AuthContext)
   return context;
 }
