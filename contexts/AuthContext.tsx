import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setCookie,parseCookies,destroyCookie } from 'nookies';
import Router from 'next/router';
import { api } from "../services/apiClient";


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
 
 export function signOut() {
    destroyCookie(undefined,'nextauth.token');
    destroyCookie(undefined,'nextauth.refreshToken');

    Router.push('/')
 }
 
 export function AuthProvider({children}: AuthProviderProps) {
    const [user,setUser] = useState<User>()
    const isAuthenticated = !!user;

    useEffect(()=>{
        const {'nextauth.token':token} = parseCookies();

        if(token){
            api.get('/me')
            .then(resp => {
                const {email,permissions,roles} = resp.data;
                setUser({ email,permissions,roles });
            })
            .catch(() =>{
                signOut();
            })
        }
    },[])
    
    const signIn = async ({email,password}:SignInCredentials) =>{
        try {
           const response = await api.post('sessions',{
               email,
               password
           });    
   
           const { permissions ,roles, token, refreshToken  } = response.data;
           setCookie(undefined, 'nextauth.token', token, {
               maxAge: 60 * 60 *  24  * 30, // 30 days
               path:'/' // all pages

           });
           setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
            maxAge: 60 * 60 *  24  * 30, // 30 days
            path:'/' // all pages
        } );
           setUser({
               email,
               permissions,
               roles
           })
           api.defaults.headers['Authorization'] = `Bearer ${token}`
           
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
