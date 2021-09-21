import { createContext, ReactNode, useContext } from "react";

interface SignInCredentials {
    email:string;
    password:string;
}

interface AuthContextData {
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;
};

interface AuthProviderProps {
    children:ReactNode;
}
 export const AuthContext = createContext({} as AuthContextData);

 const isAuthenticated = false;

 const signIn = async ({email,password}:SignInCredentials) =>{
    console.log({email,password});
 }
 
 export function AuthProvider({children}: AuthProviderProps) {
     return (
        <AuthContext.Provider value={{signIn,isAuthenticated}}> {children} </AuthContext.Provider>
     );
 }


 export const useAuth = () => {
   const context =  useContext(AuthContext)
   return context;
 }
