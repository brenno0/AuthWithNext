import React, { useEffect } from "react"
import { Can } from "../components/Can"
import { useAuth } from "../contexts/AuthContext"
import { setupApiClient } from "../services/api"
import { api } from "../services/apiClient"
import { AuthTokenError } from "../services/errors/authTokenError"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
    const  {user, signOut} = useAuth()
   
    useEffect(() => {
        api.get('/me').then(response=> {console.log(response)})
        .catch(err => console.log(err))
    },[])
    
    return (
        <>
            <h1>Dashboard</h1>
            <h1>Bem vindo {user?.email}</h1>
            <button onClick={signOut}>Sign Out</button>
            
            <Can permissions={['metrics.list']}>
                <h1>Métricas</h1> 
            </Can>
        </>
    )
}

export const getServersideProps = withSSRAuth(async (ctx) => {

    const apiClient = setupApiClient(ctx)
    
        const response = await apiClient.get('/me');
    return{
        props:{}
    }
})